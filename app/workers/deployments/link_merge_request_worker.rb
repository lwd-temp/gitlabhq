# frozen_string_literal: true

module Deployments
  class LinkMergeRequestWorker
    include ApplicationWorker

    data_consistency :always

    sidekiq_options retry: 3

    queue_namespace :deployment
    idempotent!
    feature_category :continuous_delivery
    worker_resource_boundary :cpu

    def perform(deployment_id)
      if (deploy = Deployment.find_by_id(deployment_id))
        LinkMergeRequestsService.new(deploy).execute

        after_perform(deploy)
      end
    end

    private

    def after_perform(_deployment)
      # Overridden in EE
    end
  end
end

Deployments::LinkMergeRequestWorker.prepend_mod
