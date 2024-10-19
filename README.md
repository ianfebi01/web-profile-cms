# Dev

1. copy .env.sample to .env and populate
2. Run:
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```
3. visit http://localhost:1337

# Update or add dependencies to Strapi
1. shell into the strapi container `docker compose -f docker-compose.yml -f docker-compose.dev.yml run strapi bash`
2. execute yarn commands, `yarn add ...` etc. 
3. Open a new terminal, and run `docker ps` look for the instance of strapi with "run" in the name
4. copy the `yarn.lock` and `package.json` file from there, with `docker cp CONTAINER_ID:/opt/app/yarn.lock ./strapi4/strapi4-app/yarn.lock` and likewise for `package.json`

# Deploy to AWS
1. Create an organisation under the root account.
2. Ensure you have aws cli installed, and that you're configured and credentialed for the root account.
Add the relevant profile to `~/.aws/config`:
```
[default]
region = ap-southeast-2
output = json

[profile ORGANISATION_MEMORABLE_NAME]
role_arn = arn:aws:iam::ORGANISATION_ACCOUNT_ID:role/OrganizationAccountAccessRole
source_profile = default"
```
3. run `./init-aws-stack.sh ORGANISATION_MEMORABLE_NAME YOUR_PUBLIC_IP_ADDRESS`
4. ssh into the ec2 instance as the git user with `ssh git@EC2_IP_ADDRESS`
5. create an app directory, eg /home/git/YOUR_APP_NAME
6. create a git repo `git init --bare /var/git/YOUR_REPO_NAME.git`
7. copy the `post-receive.sample` file from this repo to `/var/git/YOUR_REPO_NAME.git/hooks/post-receive`, adjust the first two lines to match your app name and repo name, and make it executable with `chmod u+x /var/git/YOUR_REPO_NAME.git/hooks/post-receive`
8. setup a .env file in `/home/git/YOUR_APP_NAME/.env`, and make it editable only by root/ec2-user with `chmod 400 /home/git/YOUR_APP_NAME/.env`
9. add remote to your local git repo. `git remote add aws git@EC2_IP_ADDRESS:/var/git/YOUR_REPO_NAME.git`
10. push changes to aws `git push aws main`
