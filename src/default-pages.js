// This should be kept in sync with cypress-scenario-runner
const defaultPages = `{
  'login': '/login',
  'home': '/home',

  'projects': '/projects',
  'a project': new RegExp('/projects/\d+$'),
  'create new project': '/projects/new',
}`;
