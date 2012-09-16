require 'models/project'

module Api
  module V1
    class App < Sinatra::Base
      before '/projects/:id/files*' do
        @project = Project.find(params[:id])
      end

      # Lists all files in the specified path
      get '/projects/:id/files' do
        @project.files_in(params[:path]).to_json
      end

      # Gets the content of a specified file, using :path
      get '/projects/:id/files/content' do
        @project.file_content(params[:path]).to_json
      end

      # Updates the content of a file, through :path and :content
      put '/projects/:id/files/content' do
        @project.update_file(params[:path], params[:content]).to_json
      end

      put '/projects/:id/files/rename' do
        @project.rename_file(params[:path], params[:new_path]).to_json
      end

      # Destroys a file
      delete '/projects/:id/files/destroy' do
        @project.destroy_file(params[:path])

        halt 200
      end

      # Creates a new file or folder
      post '/projects/:id/files/new' do
        if data = @project.new_file(params[:path], params[:name], params[:type])
          {
            :result => :ok,
            :data => data
          }.to_json
        else
          {:result => :exists}.to_json
        end
      end

    end
  end
end