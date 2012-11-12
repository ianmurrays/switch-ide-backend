$LOAD_PATH.unshift File.expand_path(File.dirname(__FILE__))

require "rubygems"
require "bundler/setup"

Bundler.require

require 'zip/zip'
require 'zip/zipfilesystem'

require 'app'

# Require Models
require 'models/model'
require 'models/user'
require 'models/project'

# Require Controllers
require 'controllers/authentication'
require 'controllers/projects'
require 'controllers/files'

# Set the database
Mongoid.load!("./api/v1/config/mongoid.yml", Sinatra::Base.settings.environment)