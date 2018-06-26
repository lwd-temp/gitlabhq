module QA
  feature 'fork project', :core do
    scenario 'user submits merge request from a forked project' do
      Runtime::Browser.visit(:gitlab, Page::Main::Login)

      Page::Main::Login.act { sign_in_using_credentials }

      public_sandbox = Factory::Resource::Sandbox.fabricate! do |sandbox|
        sandbox.name = "Sandbox-#{SecureRandom.hex(8)}"
        sandbox.visibility = 'Public'
      end

      new_project = Factory::Resource::Project.fabricate! do |project|
        project.group = public_sandbox
        project.namespace = public_sandbox.name
        project.name = 'project-to-fork'
        project.visibility = 'Public'
      end

      # project needs to have at least one commit for fork button to be enabled
      Factory::Repository::ProjectPush.fabricate! do |push|
        push.project = new_project
      end

      Page::Menu::Main.act { sign_out }
      puts '1ogged out'
      new_user = Factory::Resource::User.fabricate!

      new_project.visit!
      Page::Project::Show.act { fork_project }
      Page::Project::Fork::New.act { choose_namespace new_user.name }

      expect(page).to have_content('The project was successfully forked.')

      forked_project = QA::Factory::Product.new

      Factory::Repository::ProjectPush.fabricate! do |push|
        push.project = forked_project
        push.file_name = 'file2.txt'
      end

      merge_request = Factory::Resource::MergeRequestFromFork.fabricate!

      Page::Menu::Main.act { sign_out }
      Page::Main::Login.act do
        switch_to_sign_in_tab
        sign_in_using_credentials
      end

      merge_request.visit!
      Page::MergeRequest::Show.act { merge! }

      expect(page).to have_content('The changes were merged')
    end
  end
end
