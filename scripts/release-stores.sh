#!/bin/bash

# Script to sync store branches with main branch
# Usage: ./release-stores.sh --env <prod|stag> --store <all|branch1,branch2,...>

set -e  # Exit on any error

# Default values
ENV=""
STORE_NAME=""
CURRENT_BRANCH=""

# Function to display usage
show_usage() {
    echo "Usage: $0 --env <prod|stag|all> --store <all|branch1,branch2,...>"
    echo ""
    echo "Options:"
    echo "  --env         Environment: 'prod' or 'stag' or 'all'"
    echo "  --store       Store branches: 'all' or comma-separated list of branch names"
    echo ""
    echo "Examples:"
    echo "  $0 --env prod --store all"
    echo "  $0 --env stag --store store1,store2,store3"
    exit 1
}

# Function to validate environment
validate_env() {
    if [[ "$1" != "prod" && "$1" != "stag" && "$1" != "all" ]]; then
        echo "Error: --env must be 'prod' or 'stag' or 'all', got: $1"
        exit 1
    fi
}

# Function to get all store branches
get_store_branches() {
    local env="$1"
    
    if [[ "$env" == "stag" ]]; then
        # For staging, only get branches with stag- prefix
        git branch -r \
          | grep -E "origin/stag-" \
          | sed 's/origin\///' \
          | tr '\n' ' '
    elif [[ "$env" == "prod" ]]; then
        # For production, get all branches except main and stag- branches
        git branch -r \
          | grep -vE "origin/main|origin/stag-" \
          | sed 's/origin\///' \
          | tr '\n' ' '
    else
        # For all environments, get all branches except main
        git branch -r \
          | grep -vE "origin/main" \
          | sed 's/origin\///' \
          | tr '\n' ' '
    fi
}

# Function to validate store names
validate_store_names() {
    local store_names="$1"
    local env="$2"
    local valid_branches=""
    
    if [[ "$store_names" == "all" ]]; then
        valid_branches=$(get_store_branches "$env")
        echo "$valid_branches"
        return 0
    fi
    
    # Split comma-separated list
    IFS=',' read -ra BRANCHES <<< "$store_names"
    
    for branch in "${BRANCHES[@]}"; do
        branch=$(echo "$branch" | xargs)  # Trim whitespace
        
        # Check if branch exists
        if git show-ref --verify --quiet "refs/remotes/origin/$branch"; then
            # For staging environment, validate that branch has stag- prefix
            if [[ "$env" == "stag" && "$branch" != stag-* ]]; then
                echo "Error: Branch '$branch' does not have 'stag-' prefix required for staging environment"
                exit 1
            fi
            # For production environment, validate that branch does not have stag- prefix
            if [[ "$env" == "prod" && "$branch" == stag-* ]]; then
                echo "Error: Branch '$branch' has 'stag-' prefix which is not allowed for production environment"
                exit 1
            fi
            valid_branches="$valid_branches $branch"
        else
            echo "Error: Branch '$branch' does not exist in remote repository"
            exit 1
        fi
    done
    
    echo "$valid_branches"
}

# Function to sync branch with main
sync_branch() {
    local branch="$1"
    local env="$2"
    
    echo "=== Syncing branch: $branch ==="
    
    # Store current branch
    CURRENT_BRANCH=$(git branch --show-current)
    
    # Fetch latest changes
    echo "Fetching latest changes from remote..."
    git fetch origin
    
    # Checkout to the store branch
    echo "Checking out to branch: $branch"
    git checkout "$branch"
    
    # Reset hard to origin/main
    echo "Resetting branch to origin/main..."
    git reset --hard origin/main
    
    # Push to origin
    echo "Pushing changes to origin/$branch..."
    git push origin "$branch" --force
    
    echo "Successfully synced branch: $branch"
    echo ""
}

# Function to sync all branches
sync_all_branches() {
    local branches="$1"
    local env="$2"
    
    echo "Starting sync process for environment: $env"
    echo "Branches to sync: $branches"
    echo ""
    
    # Split branches string into array
    read -ra BRANCH_ARRAY <<< "$branches"
    
    for branch in "${BRANCH_ARRAY[@]}"; do
        if [[ -n "$branch" ]]; then
            sync_branch "$branch" "$env"
        fi
    done
    
    # Return to original branch
    if [[ -n "$CURRENT_BRANCH" ]]; then
        echo "Returning to original branch: $CURRENT_BRANCH"
        git checkout "$CURRENT_BRANCH"
    fi
    
    echo "=== Sync process completed ==="
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --env)
            ENV="$2"
            shift 2
            ;;
        --store)
            STORE_NAME="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            ;;
    esac
done

# Validate required parameters
if [[ -z "$ENV" ]]; then
    echo "Error: --env parameter is required"
    show_usage
fi

if [[ -z "$STORE_NAME" ]]; then
    echo "Error: --store parameter is required"
    show_usage
fi

# Validate environment
validate_env "$ENV"

# Validate and get store branches
echo "Validating store branches..."
VALID_BRANCHES=$(validate_store_names "$STORE_NAME" "$ENV")

if [[ -z "$VALID_BRANCHES" ]]; then
    echo "Error: No valid branches found"
    exit 1
fi

# Confirm before proceeding
echo "Environment: $ENV"
echo "Branches to sync: $VALID_BRANCHES"
echo ""
read -p "Do you want to proceed with syncing these branches? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation cancelled"
    exit 0
fi

# Execute sync
sync_all_branches "$VALID_BRANCHES" "$ENV"
