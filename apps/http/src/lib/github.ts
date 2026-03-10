//I hate writing this shit
//maybe in future I might create a package that solves this issue


//this file will parse a github url into its components
//need to support both raw and blob urls

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;

interface GithubValidationResult {

    valid: boolean; //simple t/f value for immediate acceptance/denial
    error?: string;
    downloadUrl?: string;
    fileSize?: number;

}

interface ParsedGithubUrl {
    owner: string;
    repo: string;
    branch: string;
    filePath: string;
}

interface GithubContentResponse {
    type: string;
    name: string;
    size: number;
    download_url: string;
}

function parseGitHubUrl(url: string): ParsedGithubUrl | null {
    const match = url.match(
        /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:blob|raw)\/([^/]+)\/(.+)$/
    );
    if (!match) return null;
    return {
        owner: match[1]!,
        repo: match[2]!,
        branch: match[3]!,
        filePath: match[4]!,
    };
}

export async function validateGithubApkUrl(url: string): Promise<GithubValidationResult> {

    //basic url format check
    if (!url.startsWith("https://github.com/")) {
        return {
            valid: false,
            error: "URL must be a Github link (https://github.com/...)"
        }
    }

    //parse into components
    const parsed = parseGitHubUrl(url);

    if (!parsed) {
        return {
            valid: false,
            error: "Invalid Github file URL. Expected format: https://github.com/owner/repo/blob/branch/file.apk"
        }
    }

    //Extension check - fail fast, no API call needed
    //if it doesn't end with apk extension, reject
    if (!parsed.filePath.toLowerCase().endsWith(".apk")) {
        return {
            valid: false,
            error: "URL must point to an .apk file"
        }
    }

    //call github contents api
    const apiUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/${parsed.filePath}?ref=${parsed.branch}`;


    const headers: Record<string, string> = {
        Accept: "application/vnd.github+json",
        "X-Github-Api-Version": "2022-11-28",
        "User-Agent": "sandboox"
    };

    if (GITHUB_TOKEN) {
        headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
    }

    let response: Response;

    try {

        response = await fetch(apiUrl, { headers });
    } catch (error) {
        return {
            valid: false,
            error: "Could not reach Github API. Check your internet connection."
        }
    }

    //interpret the status codes
    if (response.status === 404) {
        return {
            valid: false,
            error: "File not found. Double check the repo name, branch, and file name."
        };
    }

    if (response.status === 403) {
        return {
            valid: false,
            error: "Access denied. The repository may be private or the token lacks permission."
        };
    }

    if (response.status === 422) {
        return {
            valid: false,
            error: "Invalid branch name in the URL."
        }
    }

    if (!response.ok) {
        return {
            valid: false,
            error: `Github API returned an unexpected error (${response.status}).`
        }
    }

    const data = await response.json() as GithubContentResponse;

    if (data.type !== "file") {
        return {
            valid: false,
            error: "The URL points to a directory, not a file"
        }
    }

    if (!data.size || data.size === 0) {
        return {
            valid: false,
            error: "The file appears to be empty"
        }
    }

    return {
        valid: true,
        downloadUrl: data.download_url,
        fileSize: data.size,
    }
}
