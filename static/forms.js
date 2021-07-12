words = [];
full_data = [];
examples = [];
const shuffledArr = array => array.map(a => ({ sort: Math.random(), value: a })).sort((a, b) => a.sort - b.sort).map(a => a.value);

function addElement(word, index) {
    const newDiv = document.createElement("div");
    newDiv.setAttribute("id", `word-${index}`);

    newDiv.className="word";
    // newDiv.addEventListener('mousedown', expandWord);

    var a = document.createElement('a');
    var linkText = document.createTextNode("lexem");
    a.appendChild(linkText);
    a.title = "Look up lexeme form in Wikidata";
    a.href = `https://www.wikidata.org/wiki/Lexeme:${word['lid']}#${word['form_id'].split("-")[1]}`;

    const newContent = document.createTextNode(`${word['word']} (${word['category']}) `);
    const link = document.create

    newDiv.appendChild(newContent);
    newDiv.appendChild(a);
    senseList = document.createElement('ul');
    senseList.setAttribute("id", `senses-list-${word['lid']}`);

    newDiv.appendChild(senseList);

    exampleList = document.createElement('ul');
    exampleList.setAttribute("id", `example-list-${word['lid']}`);

    newDiv.appendChild(exampleList);

    newDiv.dataset.expanded = false;
    newDiv.dataset.index = index;
    newDiv.dataset.category = word['category'];
    newDiv.dataset.form_id = word['form_id'];
    newDiv.dataset.word = word['word'];
    newDiv.dataset.word_angle_parens = word['word_angle_parens'];
    newDiv.dataset.word_spaces = word['word_spaces'];
    newDiv.dataset.lid = word['lid'];
    const currentDiv = document.getElementById("div1");

    // const ignoreButton = document.createElement('button');
    // ignoreButton.appendChild(document.createTextNode("Ignore form"));
    // ignoreButton.addEventListener('mousedown', ignoreForm);
    // newDiv.appendChild(ignoreButton);

    document.body.insertBefore(newDiv, currentDiv);
    expandWord(index);
  }

  function ignoreForm(){
    console.log("Ignore form" + this.parentNode.dataset.form_id);
    var url = new URL('http://localhost:5000/lexeme-forms/ignore/'+this.parentNode.dataset.form_id)
    fetch(url, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
        },
      body: JSON.stringify(word),
    })
    .then(response => {
    
      console.log(response);  
    }); 
  }

  function sleepForm(){
    console.log("Sleep form" + this.parentNode.dataset.form_id);
    var url = new URL('http://localhost:5000/lexeme-forms/sleep/'+this.parentNode.dataset.form_id)
    fetch(url, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
        },
      body: JSON.stringify(word),
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
    });
  }

  function createQuickStatements(lexeme_id, lang_code, sentence, form_id, sense_id, source_qid, retrieval_date) {
    return `${lexeme_id}|P5831|${lang_code}:"${sentence}"|P5830|${form_id}|P6072|${sense_id}|S248|${source_qid}|S813|+${retrieval_date}T00:00:00Z/11`;
  }

  function selectSentence() {
    form_id = this.parentNode.parentNode.dataset.form_id;
    sense_id = this.parentNode.parentNode.dataset.sense_id;
    lid = this.parentNode.parentNode.dataset.lid;
    data = JSON.parse(this.dataset.json);
    if(sense_id !== undefined) {
      lex_qs = `${lid}|${data["quickstatement"]}|P5830|${form_id}|P6072|${sense_id}|${data["reference_quickstatement"]}`;
      console.log(`Selected sentence ${data["text"]}`);
      console.log(data);
      console.log(lex_qs);
      console.log("https://quickstatements.toolforge.org/#/v1="+encodeURIComponent(lex_qs));  
      window.qs = lex_qs.replace(/\|/g,"\t");
    } else {
      console.log("No sense selected!");
    }
  }

  function selectSense() {
    form_id = this.parentNode.parentNode.dataset.form_id;
    data = JSON.parse(this.dataset.json);
    this.parentNode.parentNode.dataset.sense_id = data["sense_id"];
    console.log(`Selected sense ${data["gloss"]} (${data["sense_id"]})`);
    console.log(data);
  }


  function boldString(str, substr) {
    var strRegExp = new RegExp(substr, 'g');
    return str.replace(strRegExp, '<b>'+substr+'</b>');
  }

  function getSenses(lid) {
    fetch(`http://localhost:5000/lexeme-forms/senses-${lid}.json`, {
  method: 'GET'
})
.then(response => response.json())
.then(data => {
  console.log('Success:', data);
  list = document.getElementById(`senses-list-${lid}`);
  data.forEach(function (item) {
    let li = document.createElement('li');
    list.appendChild(li);
    li.addEventListener('mousedown', selectSense);
    li.dataset.json = JSON.stringify(item);
    if(item["wikidata_reference"]) {
      link = `<a href="https://www.wikidata.org/wiki/${item["wikidata_reference"]}">`;
      link_end = '</a>';
    } else {
      link = '';
      link_end = '';
    }
  
    li.innerHTML += `${item["gloss"]}`;
});
  if (data.length == 0) { 
    let li = document.createElement('li');
    list.appendChild(li);
    li.innerHTML = `No senses found for <em>${list.parentNode.dataset.word}</em>`;
   }

})
.catch((error) => {
  console.error('Error:', error);
});
  }

  function expandWord(index) {
      word = full_data[index];
      element = document.getElementById(`word-${index}`);
    console.log(`expandWord(${index}). word=${JSON.stringify(word)}`)
      if(element.dataset.expanded === "true") { return false; }
    console.log("Fetch candidates for examples of " + word['word']);
    var url = new URL('http://localhost:5000/lexeme-forms/examples.json')
    element.dataset.expanded = true;

      fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
            },
          body: JSON.stringify(word),
        })
      .then(response => response.json())
      .then(data => {
        word = full_data[index];
  
        console.log(`expandWord--success: ${JSON.stringify(word)} ${index}`);
        examples = data;
        list = document.getElementById(`example-list-${word['lid']}`);
        data.forEach(function (item) {
          let li = document.createElement('li');
          list.appendChild(li);
          li.addEventListener('mousedown', selectSentence);
          li.dataset.json = JSON.stringify(item);
          if(item["wikidata_reference"]) {
            link = `<a href="https://www.wikidata.org/wiki/${item["wikidata_reference"]}">`;
            link_end = '</a>';
          } else {
            link = '';
            link_end = '';
          }
        
          li.innerHTML += `${boldString(item["text"],word["word"])} <span class="source">(${link}${item["source"]} ${item["date"]}${link_end})</span>`;
      });
        if (data.length == 0) { 
          let li = document.createElement('li');
          list.appendChild(li);
          li.innerHTML = `No examples found for <em>${word["word"]}</em>`;      
          li.parentNode.parentNode.className="word noexamples";
          index = Math.floor(Math.random() * full_data.length);
          console.log(`index: ${index}`);
          addElement(full_data[index],index);
      
         } else {
          const ignoreButton = document.createElement('button');
          ignoreButton.appendChild(document.createTextNode("Ignore form"));
          ignoreButton.addEventListener('mousedown', ignoreForm);
          const sleepButton = document.createElement('button');
          sleepButton.appendChild(document.createTextNode("Sleep form"));
          sleepButton.addEventListener('mousedown', sleepForm);
          list.parentNode.appendChild(ignoreButton);
          list.parentNode.appendChild(sleepButton);
         }
        getSenses(word["lid"]);
      })
      .catch((error) => {
        console.error('Error:', error);
        word = full_data[index];
        console.log(word);
  
        list = document.getElementById(`example-list-${word['lid']}`);
        list.className='servererror';

      });
      
  }

fetch('http://localhost:5000/lexeme-forms/words.json', {
  method: 'GET'
})
.then(response => response.json())
.then(data => {
  console.log('Success:', data);
  full_data = data;
  words = data.map(function(a){return a.word});
  for (var i = 0; i < 2; i++) {
    index = Math.floor(Math.random() * words.length);
    console.log(`index: ${index}`);
    addElement(data[index],index);
    }
})
.catch((error) => {
  console.error('Couldnt fetch list with lexemes. Error:', error);

});

