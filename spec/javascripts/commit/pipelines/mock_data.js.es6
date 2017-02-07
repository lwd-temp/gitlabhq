/* eslint-disable no-unused-vars */
const pipeline = {
  id: 73,
  user: {
    name: 'Administrator',
    username: 'root',
    id: 1,
    state: 'active',
    avatar_url: 'http://www.gravatar.com/avatar/e64c7d89f26bd1972efa854d13d7dd61?s=80&d=identicon',
    web_url: 'http://localhost:3000/root',
  },
  path: '/root/review-app/pipelines/73',
  details: {
    status: {
      icon: 'icon_status_failed',
      text: 'failed',
      label: 'failed',
      group: 'failed',
      has_details: true,
      details_path: '/root/review-app/pipelines/73',
    },
    duration: null,
    finished_at: '2017-01-25T00:00:17.130Z',
    stages: [{
      name: 'build',
      title: 'build: failed',
      status: {
        icon: 'icon_status_failed',
        text: 'failed',
        label: 'failed',
        group: 'failed',
        has_details: true,
        details_path: '/root/review-app/pipelines/73#build',
      },
      path: '/root/review-app/pipelines/73#build',
      dropdown_path: '/root/review-app/pipelines/73/stage.json?stage=build',
    }],
    artifacts: [],
    manual_actions: [
      {
        name: 'stop_review',
        path: '/root/review-app/builds/1463/play',
      },
      {
        name: 'name',
        path: '/root/review-app/builds/1490/play',
      },
    ],
  },
  flags: {
    latest: true,
    triggered: false,
    stuck: false,
    yaml_errors: false,
    retryable: true,
    cancelable: false,
  },
  ref:
  {
    name: 'master',
    path: '/root/review-app/tree/master',
    tag: false,
    branch: true,
  },
  commit: {
    id: 'fbd79f04fa98717641deaaeb092a4d417237c2e4',
    short_id: 'fbd79f04',
    title: 'Update .gitlab-ci.yml',
    author_name: 'Administrator',
    author_email: 'admin@example.com',
    created_at: '2017-01-16T12:13:57.000-05:00',
    committer_name: 'Administrator',
    committer_email: 'admin@example.com',
    message: 'Update .gitlab-ci.yml',
    author: {
      name: 'Administrator',
      username: 'root',
      id: 1,
      state: 'active',
      avatar_url: 'http://www.gravatar.com/avatar/e64c7d89f26bd1972efa854d13d7dd61?s=80&d=identicon',
      web_url: 'http://localhost:3000/root',
    },
    author_gravatar_url: 'http://www.gravatar.com/avatar/e64c7d89f26bd1972efa854d13d7dd61?s=80&d=identicon',
    commit_url: 'http://localhost:3000/root/review-app/commit/fbd79f04fa98717641deaaeb092a4d417237c2e4',
    commit_path: '/root/review-app/commit/fbd79f04fa98717641deaaeb092a4d417237c2e4',
  },
  retry_path: '/root/review-app/pipelines/73/retry',
  created_at: '2017-01-16T17:13:59.800Z',
  updated_at: '2017-01-25T00:00:17.132Z',
};

module.exports = pipeline;
