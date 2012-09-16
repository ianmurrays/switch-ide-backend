module Api
  module V1
    class App < Sinatra::Base
      # Enable COR (for now)
      def set_cor_headers
        headers["Access-Control-Allow-Origin"]  = "*"
        headers["Access-Control-Allow-Methods"] = %w{GET POST PUT DELETE}.join(",")
        headers["Access-Control-Allow-Headers"] = %w{Origin Accept Content-Type X-Requested-With X-CSRF-Token}.join(",")
      end

      before        { set_cor_headers }
      options(/.*/) { set_cor_headers }

      # This is a JSON API
      before { content_type :json }
    end
  end
end