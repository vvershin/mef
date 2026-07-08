const SETTINGS_KEY = 'github_settings';

export interface GitHubSettings {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

export const loadGitHubSettings = (): GitHubSettings | null => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveGitHubSettings = (settings: GitHubSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

const getFileSha = async (
  settings: GitHubSettings,
  path: string
): Promise<string | null> => {
  const res = await fetch(
    `https://api.github.com/repos/${settings.owner}/${settings.repo}/contents/${path}?ref=${settings.branch}`,
    { headers: { Authorization: `Bearer ${settings.token}`, Accept: 'application/vnd.github+json' } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.sha ?? null;
};

export const fetchFileFromGitHub = async (
  settings: GitHubSettings,
  path: string
): Promise<object> => {
  const res = await fetch(
    `https://api.github.com/repos/${settings.owner}/${settings.repo}/contents/${path}?ref=${settings.branch}`,
    { headers: { Authorization: `Bearer ${settings.token}`, Accept: 'application/vnd.github+json' } }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub API error ${res.status}`);
  }

  const data = await res.json();
  const content = decodeURIComponent(escape(atob(data.content)));
  return JSON.parse(content);
};

export const publishFileToGitHub = async (
  settings: GitHubSettings,
  path: string,
  content: object,
  commitMessage: string
): Promise<void> => {
  const sha = await getFileSha(settings, path);
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2))));

  const body: Record<string, string> = {
    message: commitMessage,
    content: encoded,
    branch: settings.branch,
  };
  if (sha) body.sha = sha;

  const res = await fetch(
    `https://api.github.com/repos/${settings.owner}/${settings.repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${settings.token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || `GitHub API error ${res.status}`);
  }
};
