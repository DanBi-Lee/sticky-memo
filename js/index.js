// Client ID and API key from the Developer Console
var CLIENT_ID = '687369490431-51ii3ahsqoki0dm7lqd529ksks2qpjbo.apps.googleusercontent.com';
var API_KEY = 'AIzaSyBfaiOktFwYaHawdsj012ADT6YeFr-298I';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
	gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
	gapi.client
		.init({
			apiKey: API_KEY,
			clientId: CLIENT_ID,
			discoveryDocs: DISCOVERY_DOCS,
			scope: SCOPES,
		})
		.then(
			function () {
				// Listen for sign-in state changes.
				gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

				// Handle the initial sign-in state.
				updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
				authorizeButton.onclick = handleAuthClick;
				signoutButton.onclick = handleSignoutClick;
			},
			function (error) {
				appendPre(JSON.stringify(error, null, 2));
			}
		);
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */

const h1 = document.querySelector('h1');
const body = document.querySelector('body');

function updateSigninStatus(isSignedIn) {
	if (isSignedIn) {
		authorizeButton.style.display = 'none';
		signoutButton.style.display = 'block';
		h1.className = "hiding";
		body.className = "";
		newMemoBtn.className = "";
		getMemos();
	} else {
		authorizeButton.style.display = 'block';
		signoutButton.style.display = 'none';
		h1.className = "";
		body.className = "center";
		newMemoBtn.className = "hiding";
		memosContainer.innerText = "";
	}
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
	gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
	gapi.auth2.getAuthInstance().signOut();
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
	var pre = document.getElementById('content');
	var textContent = document.createTextNode(message + '\n');
	pre.appendChild(textContent);
}

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */

function openMemo(memo) {
	const editorWindow = window.open('editor.html', `memo-${memo.id}`, 'width=570, height=350');
	memo.editorWindow = editorWindow;
}

const memos = [];
window.memos = memos;

function getMemos() {
	gapi.client.sheets.spreadsheets.values
		.get({
			spreadsheetId: '1aNlhhaXnqtFeSwizDzemJ7hN8RKZRA5chRef-TyKwwo',
			range: 'memos!A2:D',
		})
		.then(
			function (response) {
				console.log(response);
				response.result.values.forEach((value, idx) => {
					const [id, content, created_at, updated_at] = value;
					if (id === undefined) return;
					const memo = {
						id: Number(id),
						content,
						created_at,
						updated_at,
						range: `memos!A${idx + 2}:D${idx + 2}`,
					};
					memos[Number(id)] = memo;
					display(memo);
				});
			},
			function (response) {
				appendPre('Error: ' + response.result.error.message);
			}
		);
}

const memosContainer = document.querySelector('.memos-container');

function display(memo) {
	const memoTag = document.createElement('div');
	const viewerTag = document.createElement('div');
	const deleteBtn = document.createElement('button');
	
	memoTag.setAttribute('class', 'memo');
	viewerTag.setAttribute('class', 'viewer');
	
	memosContainer.appendChild(memoTag);
	memoTag.appendChild(viewerTag);
	memoTag.appendChild(deleteBtn);
	deleteBtn.innerText = '삭제';
	
	const viewer = toastui.Editor.factory({
		el: viewerTag,
		viewer: true,
		initialValue: memo.content,
	});
	
	memo.viewer = viewer;
	viewerTag.addEventListener('click', ()=>openMemo(memo));
	deleteBtn.addEventListener('click', ()=>deleteMemo(memo));
}

function createMemo() {
	// const newId = 1;
	let newId = memos.findIndex((v, idx)=> idx !== 0 && v===undefined);
	if(newId === -1){
		newId = memos.length;
	}
	
	const content = '새로운 메모';
	const created_at = new Date();
	const updated_at = created_at;
	gapi.client.sheets.spreadsheets.values
		.append({
			spreadsheetId: '1aNlhhaXnqtFeSwizDzemJ7hN8RKZRA5chRef-TyKwwo',
			range: 'memos!A2:D2',
			values: [[newId, content, created_at, updated_at]],
			valueInputOption: 'RAW',
		})
		.then(
			function (response) {
				const range = response.result.updates.updatedRange;
				console.log(response);
				const memo = {
					id:newId,
					content,
					created_at,
					updated_at,
					range
				};
				memos[newId] = memo;
				display(memo);
			},
			function (response) {
				console.log(response);
			}
		);
}

const newMemoBtn = document.querySelector('#new-memo-btn');
newMemoBtn.addEventListener('click', createMemo);

function updateMemo({ id, content, created_at, updated_at, range }) {
	gapi.client.sheets.spreadsheets.values
		.update({
			spreadsheetId: '1aNlhhaXnqtFeSwizDzemJ7hN8RKZRA5chRef-TyKwwo',
			range: range,
			values: [[id, content, created_at, updated_at]],
			valueInputOption: 'RAW',
		})
		.then(
			function (response) {
				console.log(response);
			},
			function (response) {
				console.log(response);
			}
		);
}
function deleteMemo(memo) {
	gapi.client.sheets.spreadsheets.values
		.clear({
			spreadsheetId: '1aNlhhaXnqtFeSwizDzemJ7hN8RKZRA5chRef-TyKwwo',
			range: memo.range,
		})
		.then(
			function (response) {
				console.log(response);
				memo.viewer.preview.previewContent.closest('.memo').remove();
				memos[memo.id] = undefined;
				
				memo.editorWindow.close();
			},
			function (response) {
				console.log(response);
			}
		);
}