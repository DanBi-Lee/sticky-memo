const memoId = window.name.slice(5);
const memo = opener.memos[memoId];

const Editor = toastui.Editor;

let saveTimer = 2;
setInterval(()=>{
	console.log('흠...');
	if (saveTimer > 0){
		saveTimer -=1;
		if(saveTimer == 0){
			opener.updateMemo(memo);
		}
	}
}, 1000);

const editor = new Editor({
	el: document.querySelector('#editor'),
	height: '500px',
	initialEditType: 'markdown',
	previewStyle: 'vertical',
	initialValue : memo.content,
	events : {
		change() {
			const content = editor.getMarkdown();
			memo.content = content;
			memo.updated_at = new Date();
			memo.viewer.setMarkdown(content);
			saveTimer = 2;
		}
	}
});

editor.getMarkdown();