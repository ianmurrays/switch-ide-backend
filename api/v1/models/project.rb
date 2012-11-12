require "securerandom"
require "open3"

module Api
  module V1
    class Project < Model
      include Mongoid::Timestamps
      include ::Grit

      field :name, :type => String
      field :path, :type => String
      field :port, :type => Integer
      
      validates :name, :presence => true

      before_create :create_project
      before_create :randomize_port
      before_destroy :destroy_project # FIXME

      belongs_to :user

      # Public: Returns a list of files in the specified folder.
      #
      # folder - The folder to list, inside this project
      #
      # Examples
      #
      #   files_in "app"
      #   # => [{name: "folder", type: :folder, parent: "folder_name"}, ...]
      #
      # Returns an array of folders and files.
      def files_in(folder = "")
        # Remove leading and trailing slashes
        folder.gsub! /^\//, ""
        folder.gsub! /\/$/, ""

        files = Dir["#{self.full_path}/#{folder}/*"].collect do |entry|
          next if %w{server.js node_modules}.include? File.basename(entry)
          self.file_to_hash entry, folder
        end
      end

      def file_to_hash(file, folder)
        {
          :name => File.basename(file),
          :parent => folder,
          :type => if File.directory?(file)
            :directory
          else
            :file
          end
        }
      end

      # Public: Returns a hash with the file's content.
      #
      # path - the path of the file, relative to the root of the project
      #
      # Returns a hash with file info.
      def file_content(path)
        if FileTest.exists? self.full_path(path) and ! File.directory? self.full_path(path)
          {
            :content => File.read(self.full_path(path))
          }
        end
      end

      # Public: Changes the content of a file
      #
      # path - the path to the file, relative to the root of the project
      # content - the new content. Note that the content gets replaced entirely.
      #
      # Returns the content of the file
      def update_file(path, content)
        if FileTest.exists? self.full_path(path) and ! File.directory? self.full_path(path)
          File.open(self.full_path(path), 'w') do |file|
            file.write content
          end
        end

        # Return the new content
        self.file_content(path)
      end

      def rename_file(path, new_path)
        if FileTest.exists? self.full_path(path)
          File.rename self.full_path(path), self.full_path(new_path)
        end

        directory = File.split(new_path).first

        self.file_to_hash self.full_path(new_path), directory
      end

      def destroy_file(path)
        full_path = self.full_path(path)

        if FileTest.exists?(full_path)
          if File.directory?(full_path)
            FileUtils.rm_rf full_path
          else
            File.unlink full_path
          end
        end
      end

      def new_file(path, name, type)
        new_path = self.full_path("#{path}/#{name}")
        if FileTest.exists? new_path
          false
        else
          # Create it
          if type == "file"
            FileUtils.touch new_path
          elsif type == "folder"
            Dir.mkdir new_path
          end

          self.file_to_hash new_path, path
        end
      end

      def full_path(append = "")
        append = "/#{append}" unless append.empty?
        "./projects/#{self.path}#{append}"
      end

      # Builds the project using brunch
      def build_project
        output, result = ::Open3.capture2e "cd #{self.full_path} && brunch build"

        {
          :output => output,
          :result => (output =~ /error/ || ! (output =~ /compiled/))
        }
      end

      def run_project
        # If we don't have a port yet, create one.
        unless self.port
          randomize_port
          save!
        end

        output, result = ::Open3.capture2e "cd #{self.full_path} && forever stop server.js #{self.port} && forever start server.js #{self.port}"

        {
          :output => output,
          :url => "#{Api::V1::App.settings.run_url}:#{self.port}",
          :result => !(output =~ /Forever processing file/)
        }
      end

      def archive_path
        File.join(self.full_path, self.name) + ".zip"
      end

      def archive_project
        output, result = ::Open3.capture2e "cd #{self.full_path} && brunch build -m"

        unless (output =~ /error/ || ! (output =~ /compiled/))
          # Zip it tight
          path = File.join(self.full_path, "public")
          path.sub!(%r[/$], "")
          archive = self.archive_path
          FileUtils.rm archive, :force => true

          Zip::ZipFile.open(archive, 'w') do |zipfile|
            Dir["#{path}/**/**"].reject{ |f| f == archive }.each do |file|
              zipfile.add(file.sub(path + '/', ''), file)
            end
          end

          archive
        else
          false
        end
      end

      def initialize_git
        Repo.init(self.full_path)
      end

      private

      def create_project
        # Create a random path and the project
        self.path = "#{self.name}-#{SecureRandom.hex(10)}"
        unless system "brunch new #{self.full_path} -s git://github.com/ianmurrays/brunch-crumbs.git"
          # TODO: Uh-oh
        end
      end

      def randomize_port
        begin
          self.port = 8000 + rand(2000)
        end until Project.where(port: self.port).count == 0
      end

      def destroy_project
        system "rm -rf #{self.full_path}"
      end
    end
  end
end