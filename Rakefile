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

task :s => :server
task :c => :console