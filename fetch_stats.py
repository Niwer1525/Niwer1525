import os
import json
import requests
from datetime import datetime

# CONFIGURATION
TOKEN = os.getenv("GH_TOKEN")
HEADERS = {"Authorization": f"Bearer {TOKEN}"}
URL = "https://api.github.com/graphql"

def run_query(query, variables):
    response = requests.post(URL, json={'query': query, 'variables': variables}, headers=HEADERS)
    return response.json()

# 1. Fetch User Info (Join Date)
user_info = run_query("{ viewer { login createdAt } }", {})
viewer = user_info['data']['viewer']
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
    data = result['data']['viewer']['contributionsCollection']
    
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
total_stars = sum(repo['stargazerCount'] for repo in stars_data['data']['viewer']['repositories']['nodes'])
all_stats["all_time_stars"] = total_stars

# OUTPUT
json_output = json.dumps(all_stats, indent=2)

# Save to file
with open("github_full_stats.json", "w") as f:
    f.write(json_output)