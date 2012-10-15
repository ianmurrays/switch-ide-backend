module Api
  module V1
    class User < Model
      include Mongoid::Timestamps

      field :name, :type => String
      field :email, :type => String
      field :github_uid, :type => Integer
      field :allowed, :type => Boolean, :default => false

      has_many :projects
    end
  end
end