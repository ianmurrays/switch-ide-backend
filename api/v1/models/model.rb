module Api
  module V1
    class Model
      include Mongoid::Document

      # Public: Adds an "id" field to the returned JSON
      #
      # Returns the correct json for the frontend.
      def as_json(options = {})
        attrs = super(options)
        attrs["id"] = attrs["_id"]
        attrs.delete "_id"
        attrs
      end
    end
  end
end