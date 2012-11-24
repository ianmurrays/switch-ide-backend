task :default => [:server]

task :environment do
  require "./api/v1/boot"
end

desc "Runs the development server (default)"
task :server do
  system "rackup"
end

desc "Runs the console"
task :console => :environment do
  require "irb"
  include Api::V1
  ARGV.clear
  IRB.start
end

desc "Creates a test user to try out Switch IDE"
task :bootstrap => :environment do
  include Api::V1
  User.create :name => "Test", :email => "test@test.com", :github_uid => 0, :allowed => true
  puts "Done!"
end

task :s => :server
task :c => :console
