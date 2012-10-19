module Api
  module V1
    class App < Sinatra::Base
      # This is a JSON API
      before { content_type :json }

      # Further configuration
      enable :sessions
      set :session_secret, "bc550a3fdc369f77dc40e6f648cf41bbea5473f00ea2a71e0a591b587564dcacb330b69dd017fae5d501606f7abd375fb29b62edd6a553648261bcf5979eb4f4"

      configure :development do
        register Sinatra::Reloader
        set :url, "http://localhost:9292"

        set :github_key, "fb319448e45503b6df9c"
        set :github_secret, "8413267392254f8d2abc44c72099bbde0b95de0a"

        # Enable COR (development only)
        def set_cor_headers
          headers["Access-Control-Allow-Origin"]  = "*"
          headers["Access-Control-Allow-Methods"] = %w{GET POST PUT DELETE}.join(",")
          headers["Access-Control-Allow-Headers"] = %w{Origin Accept Content-Type X-Requested-With X-CSRF-Token}.join(",")
        end

        before        { set_cor_headers }
        options(/.*/) { set_cor_headers }
      end

      configure :production do
        set :url, "http://switch.ianmurray.me"

        set :github_key, "bc136506f61f660a2690"
        set :github_secret, "31065b4d9c7fadddc731a3fd9c617ffebe4bddd3"
      end

      use OmniAuth::Builder do
        provider :github, Api::V1::App.settings.github_key, Api::V1::App.settings.github_secret
      end

      # Utility methods
      def site_url(url)
        url = url[0] == "/" ? url : "/#{url}"

        settings.url + url
      end

      def authenticate!
        if session[:user]
          # Validate that the session exists
          user = session[:user]

          if @user = User.find_by(github_uid: user.github_uid, email: user.email, name: user.name)
            return
          end
        end

        # Not a valid session, bye!
        session[:user] = nil
        throw(:halt, [401, "Not authorized\n"])
      end
    end
  end
end