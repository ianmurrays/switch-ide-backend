require './api/v1/boot'

# This leaves place to add the frontend here as well
use Rack::Static, :root => "./public", :index => 'index.html'
use Rack::Static, :root => "./frontend", :index => 'index.html'

map('/api/v1') { run Api::V1::App }
map('/frontend') { run Rack::Directory.new("./frontend") }
map('/') { run Rack::Directory.new("./public") }