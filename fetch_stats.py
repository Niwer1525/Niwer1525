import os
import json
import requests
from datetime import datetime

# CONFIGURATION
TOKEN = os.getenv("GH_TOKEN") or os.getenv("STATS_TOKEN")  # Support both GH_TOKEN and STATS_TOKEN env vars
HEADERS = {"Authorization": f"Bearer {TOKEN}"}
URL = "https://api.github.com/graphql"

if not TOKEN:
  raise RuntimeError("GH_TOKEN is not set. Please export GH_TOKEN with a valid GitHub personal access token.")

def run_query(query, variables):
  response = requests.post(URL, json={'query': query, 'variables': variables}, headers=HEADERS)

  if response.status_code != 200:
    raise RuntimeError(f"GitHub GraphQL request failed: HTTP {response.status_code} - {response.text}")

  payload = response.json()
  if "errors" in payload and payload["errors"]:
    errors = "; ".join(err.get("message", str(err)) for err in payload["errors"])
    raise RuntimeError(f"GitHub GraphQL returned errors: {errors}")

  if "data" not in payload:
    raise RuntimeError(f"GitHub GraphQL response missing 'data': {payload}")

  return payload

# 1. Fetch User Info (Join Date)
user_info = run_query("{ viewer { login createdAt } }", {})
viewer = user_info.get('data', {}).get('viewer')
if not viewer:
  raise RuntimeError(f"Unable to read viewer info from response: {user_info}")

username = viewer['login']
start_year = datetime.strptime(viewer['createdAt'], "%Y-%m-%dT%H:%M:%SZ").year
current_year = datetime.now().year

print(f"--- Fetching data for {username} ({start_year} - {current_year}) ---")

all_stats = {
    "user": username,
    "generated_at": datetime.now().isoformat(),
    "years": {}
}

# 2. Loop through every year
for year in range(start_year, current_year + 1):
    from_date = f"{year}-01-01T00:00:00Z"
    to_date = f"{year}-12-31T23:59:59Z"
    
    query = """
    query($from: DateTime!, $to: DateTime!) {
      viewer {
        contributionsCollection(from: $from, to: $to) {
          totalCommitContributions
          totalPullRequestContributions
          totalIssueContributions
          totalPullRequestReviewContributions
          restrictedContributionsCount
          contributionCalendar {
            totalContributions
          }
        }
      }
    }
    """
    
    result = run_query(query, {"from": from_date, "to": to_date})
    data = result.get('data', {}).get('viewer', {}).get('contributionsCollection')
    if not data:
      raise RuntimeError(f"Missing contributions data for year {year}: {result}")
    
    all_stats["years"][year] = {
        "commits": data['totalCommitContributions'],
        "pull_requests": data['totalPullRequestContributions'],
        "issues": data['totalIssueContributions'],
        "reviews": data['totalPullRequestReviewContributions'],
        "private_contributions": data['restrictedContributionsCount'],
        "total_combined": data['contributionCalendar']['totalContributions']
    }

# 3. Get All-Time Stars (Requires separate pagination or aggregate)
stars_query = """
{
  viewer {
    repositories(first: 100, ownerAffiliations: OWNER) {
      totalCount
      nodes {
        stargazerCount
      }
    }
  }
}
"""
stars_data = run_query(stars_query, {})
repos = stars_data.get('data', {}).get('viewer', {}).get('repositories', {}).get('nodes')
if repos is None:
  raise RuntimeError(f"Missing repositories data in stars response: {stars_data}")

total_stars = sum(repo['stargazerCount'] for repo in repos)
all_stats["all_time_stars"] = total_stars

# OUTPUT
json_output = json.dumps(all_stats, indent=2)

# Save to file
with open("github_full_stats.json", "w") as f:
    f.write(json_output)