# frozen_string_literal: true

RSpec.shared_examples 'alerts service responds with an error and takes no actions' do |http_status|
  include_examples 'alerts service responds with an error', http_status

  it_behaves_like 'does not create an alert management alert'
  it_behaves_like 'does not create a system note for alert'
  it_behaves_like 'does not process incident issues'
  it_behaves_like 'does not send alert notification emails'
end

RSpec.shared_examples 'alerts service responds with an error' do |http_status|
  specify do
    expect(subject).to be_error
    expect(subject.http_status).to eq(http_status)
  end
end

# This shared_example requires the following variables:
# - `service`, a service which includes ::IncidentManagement::Settings
RSpec.shared_context 'incident management settings enabled' do
  let(:auto_close_incident) { true }
  let(:create_issue) { true }
  let(:send_email) { true }

  let(:incident_management_setting) do
    double(
      auto_close_incident?: auto_close_incident,
      create_issue?: create_issue,
      send_email?: send_email
    )
  end

  before do
    allow(ProjectServiceWorker).to receive(:perform_async)
    allow(service)
      .to receive(:incident_management_setting)
      .and_return(incident_management_setting)
  end
end

RSpec.shared_examples 'processes never-before-seen alert' do
  it_behaves_like 'creates an alert management alert or errors'
  it_behaves_like 'creates expected system notes for alert', :new_alert
  it_behaves_like 'processes incident issues if enabled'
  it_behaves_like 'sends alert notification emails if enabled'
end

RSpec.shared_examples 'processes never-before-seen recovery alert' do
  it_behaves_like 'creates an alert management alert or errors'
  it_behaves_like 'creates expected system notes for alert', :new_alert
  it_behaves_like 'sends alert notification emails if enabled'
  it_behaves_like 'processes incident issues if enabled'
end

RSpec.shared_examples 'processes one firing and one resolved prometheus alerts' do
  it 'creates AlertManagement::Alert' do
    expect(Gitlab::AppLogger).not_to receive(:warn)

    expect { subject }
      .to change(AlertManagement::Alert, :count).by(1)
      .and change(Note, :count).by(1)
  end

  it_behaves_like 'processes incident issues'
  it_behaves_like 'sends alert notification emails', count: 1
end
