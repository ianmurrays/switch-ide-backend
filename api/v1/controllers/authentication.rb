module Api
  module V1
    class App < Sinatra::Base
      get '/login' do
        redirect to('/auth/github')
      end

      get '/auth/github/callback' do
        auth = request.env["omniauth.auth"]
        user = User.find_or_create_by github_uid: auth.uid, name: auth.info.name, email: auth.info.email
        
        if user.allowed
          session[:user] = user
          redirect site_url('/frontend')
        else
          redirect site_url('thanks.html')
        end
      end
    end
  end
end