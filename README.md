# Application to Deploy a Node Web App To Azure

With the hooks-deploy-to-azure npm package you can deploy your Node web app to Azure.
  
Get started today with a [free Azure account](https://azure.com/free/open-source)!
  
This repository contains a node script that will set your GitHub repository so that you can deploy your node app to Azure without leaving your git terminal.

## Getting Started

 - Run the following command inside the root of your repository.
 ```
   npm i @shubham-agarwal-27/hooks-deploy-to-azure
 ```  
 - This creates a folder "@shubham-agarwal-27/hooks-deploy-to-azure" inside the node_modules folder.
 - By staying in the root of your repository, run the following node command:
 ```
   node node_modules/@shubham-agarwal-27/hooks-deploy-to-azure
 ```
 - Now, open the workflow_inputs.txt file that has been created in the root of your repository and give the following inputs:
   - **[Azure Tenant ID](https://github.com/shubham-agarwal-27/hooks-deploy-to-azure#azure-tenant-id)** (Required)
   - **[Subscription](https://github.com/shubham-agarwal-27/hooks-deploy-to-azure#subscription-id)** (Required)
   - **[Resource group](https://github.com/shubham-agarwal-27/hooks-deploy-to-azure#resource-group)** (Optional)
   - **[Resource](https://github.com/shubham-agarwal-27/hooks-deploy-to-azure#resource)** (Optional. If you gave an existing resource group in above input, make sure no resource exists with this name in the given resource group)  
 - The inputs should be in the following format:
    ```
        github_PAT: <guid>
        tenant_id: <guid>
        subscription: <guid>
        resource_group: sampleresourcegroup
        resource: sampleresource
    ```
  - Once, the inputs have been supplied, go ahead with committing your changes to GitHub. Once git push is run, you will be prompted for Azure login, where you would be asked for your consent. Once authorized, your commits would be pushed and a GitHub Workflow would be triggered.
  - The Workflow run can be viewed in your browser by running the following command from the root of your repository:
    ```
      node open_workflow_run
    ```

## GitHub PAT
  - It is a mandatory input and this token will be used in creating secrets in your GitHub account which are required during the workflow execution.
  - The token should have a repo_scope.
  - How to get the GitHub PAT token?
    - Go to https://github.com
    - Go Settings in your account
    - Click on Developer Settings
    - Click on Personal access tokens and then further click on "Generate new token"
    - Give some note associated with the token for your aid
    - Select the repo scope for this token and Click on Generate token.
    - Make sure you copy the token being shown to you as you won't be able to get the value in future
    - Open the workflow_inputs.txt file in your local repository. 
    - Paste the content to the right side of "github_PAT:" mentioned in the file. DO NOT CHANGE ANYTHING ELSE. The input format should be like this => "github_PAT:<GitHub_PAT>"

## Subscription ID
  - It is a mandatory input.
  - How to get the Subscription ID?:
    - Go to https://portal.azure.com
    - Go to Subscriptions
    - Select the subscription you want.
    - Copy the subscription id
    - Paste the content to the right side of "tenant_id:" mentioned in the file. DO NOT CHANGE ANYTHING ELSE. The input format should be like this => "subscription:<subscription_id>"

## Resource Group
  - You may give the resource group name in one of the following cases:-
    - If you have any resource group in your tenant and want to use some resource in that resource group
    - If you have any resource group in your tenant and want us to create a resource in that resource group
    - If you don't have a resource group by that name but want us to create one with the name you provide
  - Important note => "Resource group names only allow alphanumeric characters, periods, underscores, hyphens and parenthesis and cannot end in a period."
  - If you don't provide us with a resource group name then one will be created for you with the name => ResGrp${{Alpha numeric characters of your repository name}} => example - "ResGrpnodeexpressappshubag" where the repository name is "node-express-app-shubag"
  - How to check resource groups in your tenant?
    - Go to https://portal.azure.com
    - Type "Resource Groups" in the search bar
    - A list is shown for various resource groups in your tenant
    - Copy the name of the resource group that contains the resosurce to be used.
    - The input format should be like this => "resource_group:<resource_group_name>"

## Resource
  - You may give the resource name in one of the following cases:-
    - If you have any resource in the resource group name you provided
    - If you don't have a resource by this name, but want one to be created in the resource group name you provided
    - If you don't have a resource by this name, but want one to be created in the resource group which we custom create for you
  - Important note => "Resource names only allow alphanumeric characters"
  - If you don't provide us with a resource group name then one will be created for you with the name => Res${{Alpha numeric characters of your repository name}} => example - "Resnodeexpressappshubag" where the repository name is "node-express-app-shubag"
  - How to check resources in your tenant?
    - Go to https://portal.azure.com
    - Type "All Resources" in the search bar
    - A list is shown for various resources in your tenant
    - Copy the name of the resource to be used.
    - The input format should be like this => "resource:<resource_name>"