require 'models/project'

module Api
  module V1
    class App < Sinatra::Base
      # Returns a list of projects on the DB
      get '/projects' do
        Project.all.to_json(:only => [:name, :path, :id])
      end

      # Returns the JSON respresentation of a single project
      get '/projects/:id' do
        project = Project.find(params[:id])
        
        halt 404 unless project

        project.to_json(:only => [:name, :path, :id])
      end

      post '/projects' do
        Project.create(:name => params[:name]).to_json(:only => [:name, :path, :id])
      end

      delete '/projects/:id' do
        Project.destroy(params[:id])

        halt 200
      end

      post '/projects/:id/build' do
        Project.find(params[:id]).build_project.to_json
      end

      post '/projects/:id/run' do
        Project.find(params[:id]).run_project.to_json
      end
    end
  end
end