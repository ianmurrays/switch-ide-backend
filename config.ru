require './api/v1/boot'

# This leaves place to add the frontend here as well
map('/api/v1') { run Api::V1::App }