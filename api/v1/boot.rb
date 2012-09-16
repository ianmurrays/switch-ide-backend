$LOAD_PATH.unshift File.expand_path(File.dirname(__FILE__))

require "rubygems"
require "bundler/setup"

require 'sinatra/base'
require 'mongo_mapper'

require 'app'

# Require Models
require 'models/model'
require 'models/project'

# Require Controllers
require 'controllers/projects'
require 'controllers/files'

# Set the database
MongoMapper.database = "switch-ide"