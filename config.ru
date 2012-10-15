require './api/v1/boot'

# This leaves place to add the frontend here as well
use Rack::Static, :root => "./public", :index => 'index.html', :cache_control => 'public'

map('/api/v1') { run Api::V1::App }
map('/') { run Rack::Directory.new("./public") }