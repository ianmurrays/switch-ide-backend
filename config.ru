require './api/v1/application'

# This leaves place to add the frontend here as well
map('/api/v1') { run Api::V1::Application }