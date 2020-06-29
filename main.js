const { exec } = require('child_process');
var express = require('express');
var app = express();
var fs = require('fs');
var keytar = require('keytar');
var opn = require('open');
const { exit } = require('process');
var AuthenticationContext = require('adal-node').AuthenticationContext;

var client_id_graph = '3c2ff05c-d8db-48bf-ac19-9b0d7294e050';
const client_id_arm = '33c31634-d8df-4199-99f6-ae4b3fef50cd';

var sampleParameters = {
    "tenant" : "common",
    "authorityHostUrl" : "https://login.microsoftonline.com",
    "clientId" : "3c2ff05c-d8db-48bf-ac19-9b0d7294e050"
};
var authorityUrl = sampleParameters.authorityHostUrl + '/' + sampleParameters.tenant;
var redirectUri = 'http://localhost:3000/callback';
var resource_graph = 'https://graph.microsoft.com';
var resource_arm = 'https://management.azure.com';
var templateAuthzUrl = 'https://login.microsoftonline.com/' + sampleParameters.tenant + '/oauth2/authorize?response_type=code&client_id=<client_id>&redirect_uri=<redirect_uri>&state=<state>&resource=<resource>&scope=<scope>';
var scopeForGraph = 'offline_access%20user.read%20Directory.AccessAsUser.All';
var scopeForARM = 'https://management.azure.com//user_impersonation';
var val;
/**
 * Read the file contents
 * @param   {String}	file_name 	The name of the file to be read
 * @return 	{Array}					The array of each line content of the given file
 */
function getFileContent(file_name){
    try{
        return fs.readFileSync(file_name).toString();
    }
    catch(err){
        throw "Cannot get the contents from " + file_name;
    }
}
/**
 * Write the file with some content
 * @param  	{String}	file_name 	the name of the file to be rewritten
 * @param  	{String} 	content		The content to be written
 * @return 	{Promise}				Resolves after the contents have been written
 */
function writeFile(file_name, content){	
	try{
        fs.writeFileSync(file_name, content);
    }
    catch(err){
		throw "Cannot write to the file: " + file_name;
    }
}
/**
 * Gets all the file names in a directory relative to the repository root directory
 * @param   {String}    dir_name 	The relative path of directory whose file contents are required
 * @return  {Promise}			    Resolves the list of files in the directory
 */
function getFilesInDirectory(dir_name){
    return new Promise((resolve, reject) => {
        exec('ls "'+dir_name+'"', (error, stdout) => {
            if(error){
                reject("Obtaining the file names in " + dir_name + " unsuccessful.");
            }
            else{
                resolve(stdout.split("\n"));
            }
        });
    });
}
/**
 * Chech whether the file with same name exists or not
 * @param   {String}    files 	The list of all the files in the repository
 * @param   {String}    file    The hook name to be checked & replace
 * @return  {Boolean}		    Return the boolean whether the file with same name exists or not
 */
function checkFileExists(files, file){
    for(var file_iterator = 0; file_iterator < files.length; file_iterator++){
        if(files[file_iterator] === file){
            return true;
        }
    }
    return false;
}
/**
 * Rename a file with new name
 * @param   {String}    oldFile 	The relative path to Old File
 * @param   {String}    newFile     The relative path to New File
 * @return  {Promise}		        Resolves after the file name has been changes
 */
function renameFile(oldFile, newFile){
    try{
        fs.renameSync(oldFile, newFile);
    }
     catch(err){
         throw "Unable to rename the file " + oldFile;
     }
}
/**
 * Append a file
 * @param   {String}    file_name 	The file to be appended
 * @param   {String}    content     The content that will be added
 * @return  {Promise}		        Resolves after the file has been appended
 */
function appendFile(file_name, content){
    try{
        fs.appendFileSync(file_name, content);
    }
    catch(err){
        throw "Cannot append to the file: " + file_name;
    }
}
/**
 * Create a Directory in the repository
 * @param   {String}    dir_name    The relative path to the directory
 * @return  {Promise} 	            Resolves after the directory has been created
 */
function createDirectory(dir_name){
    return new Promise((resolve, reject) => {
        exec('mkdir "'+dir_name+'"', (error, stdout) => {
            if(error){
                reject("Unable to create the directory: " + dir_name);
            }
            else{
                resolve();
            }
		});
    });
}

/**
 * Open the Authentication URL in default browser
 * @param  	{String} 	scope 			The scopes required by the OAuth app
 * @param  	{String} 	callback 		The redirect URL for the OAuth app
 * @param  	{String} 	client_id 		Client ID of the OAuth app
 * @param   {String}    tenant_id       Tenant to be used in the authentication URL
 * @param  	{String} 	resource 	    The resource name corresponding to Microsoft graph or ARM endpoints
 */
async function openSignInLink(scope, callback, client_id, tenant, resource){
	await opn('https://login.microsoftonline.com/'+tenant+'/oauth2/authorize?client_id='+client_id+'&response_type=code&redirect_uri='+callback+'&response_mode=query&scope='+scope+'&resource='+resource);
}
/**
 * Get the redirect  URL for the OAuth process
 * @param  {String}     callback 	    The redirect page for the OAuth app
 * @param   {String}    resource        The resource name corresponding to Microsoft graph or ARM endpoints
 * @param   {String}    redirectUri     The redirect URL for the Authentication
 * @param   {String}    client_id       Client ID of the OAuth app
 * @return {Promise}			        Resolves after getting the access token
 */
async function getCallback(callback, resource, redirectUri, client_id){
	return new Promise((resolve) => {
        app.get('/'+callback, function(req, res) {
            var authenticationContext = new AuthenticationContext(authorityUrl);
            authenticationContext.acquireTokenWithAuthorizationCode(req.query.code, redirectUri, resource, client_id, undefined, async function(err, response) {
              var message = req.query.code + '\n' + redirectUri + '\n' + resource+'\n';
              if (err) {
                message += 'error: ' + err.message + '\n';
              }
              message += JSON.stringify(response);
              if (err) {
                res.send(message);
                return;
              }
              res.send("Login Successful!");
              val = response;
              resolve();
            });
        });
	});
}
/**
 * Authenticate the user's azure account for the Microsoft Graph endpoint
 */
async function OAuthGraph(){
	await openSignInLink(scopeForGraph, 'http://localhost:3000/callback', client_id_graph, 'common',resource_graph);
	await getCallback('callback',resource_graph, 'http://localhost:3000/callback', client_id_graph);
}
/**
 * Authenticate the user's azure account for the Microsoft Graph endpoint
 */
async function OAuthARM(){
	await openSignInLink(scopeForARM, 'http://localhost:3000/callbackarm', client_id_arm, 'common',resource_arm);
	await getCallback('callbackarm', resource_arm, 'http://localhost:3000/callbackarm', client_id_arm);
}

async function main(){
    try{
        var hooks = await getFilesInDirectory(".git/hooks");
        if(checkFileExists(hooks, "pre-commit")){
            renameFile(".git/hooks/pre-commit", ".git/hooks/pre-commit.bkp");
        }
        if(checkFileExists(hooks, "pre-push")){
            renameFile(".git/hooks/pre-push", ".git/hooks/pre-push.bkp");
        }
        var open_workflow_run_text = await getFileContent(__dirname+'/open_workflow_run');
        writeFile('open_workflow_run', open_workflow_run_text);

        var pre_push_text = await getFileContent(__dirname+'/pre-push');
        writeFile('.git/hooks/pre-push', pre_push_text);

        var pre_commit_text = await getFileContent(__dirname+'/pre-commit');
        writeFile('.git/hooks/pre-commit', pre_commit_text);
        await createDirectory('templates/node');
        var workflow_text = await getFileContent(__dirname + '/templates/node/workflow.yml');
        writeFile('templates/node/workflow.yml', workflow_text);

        var config_content = await getFileContent(__dirname+'/config.yml');
        writeFile('config.yml', config_content);

        var extra_files = ['', '/open_workflow_run', '/config.yml','templates/'];
        appendFile('.gitignore', extra_files.join("\n"));

                
        app.listen(3000);
        console.log('Server started!');
        
        await OAuthGraph();
        console.log("GRAPH DONE");
        const graph_token = 'graph';
        await keytar.setPassword('graph', 'access_token', val['accessToken']);
        await keytar.setPassword('graph', 'token_type', val['tokenType']);
        await keytar.setPassword('graph', 'refresh_token', val['refreshToken']);
        await keytar.setPassword('graph', 'tenant_id', val['tenantId']);

        await OAuthARM();
        const arm_token = 'arm';
        await keytar.setPassword(arm_token, 'access_token', val['accessToken']);
        await keytar.setPassword(arm_token, 'token_type', val['tokenType']);
        await keytar.setPassword(arm_token, 'refresh_token', val['refreshToken']);
        console.log();
        console.log("Visit https://github.com/shubham-agarwal-27/hooks-deploy-to-azure/blob/master/README.md for any information.\n")
        console.log("Or you can open config.yml file created in your repository to get started with the deployment.");
        console.log();
        process.exit(0);
    }
    catch(err){
        console.log(err);
        console.log("\nProgram didn't run successfully.. Exitting..");
        process.exit(1);
    }
}

main();