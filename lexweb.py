from flask import Flask
from flask import request
import util
from flask import jsonify
from flask_caching import Cache

config = {
    "DEBUG": True,          # some Flask specific configs
    "CACHE_TYPE": "SimpleCache",  # Flask-Caching related configs
    "CACHE_DEFAULT_TIMEOUT": 300
}

app = Flask(__name__)
app.config.from_mapping(config)
cache = Cache(app)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/lexeme-forms/")
def lexeme_forms():
    return app.send_static_file('forms.html')

@app.route("/lexeme-forms/words.json")
@cache.cached(timeout=30)
def lexeme_forms_json():
    results = util.fetch_lexeme_forms()
    words = util.process_lexeme_data_web(results)

    return jsonify(words)
#    return app.send_static_file('words.json')

def make_key():
    user_data = request.get_json()

    return ",".join([f"{key}={value}" for key, value in user_data.items()])


@app.route("/lexeme-forms/examples.json", methods=['POST'])
@cache.cached(timeout=3600, make_cache_key=make_key)
def examples_json():
    content = request.get_json()
    print(content)
    # return app.send_static_file('examples.json')
    examples = util.get_examples(content)
    return jsonify(examples)

@app.route("/lexeme-forms/senses-<lid>.json")
@cache.cached(timeout=500)
def senses_json(lid):
    print(lid)
    # return app.send_static_file('examples.json')
    senses = util.fetch_senses(lid)
    return jsonify(senses)

@app.route("/lexeme-forms/riksdag-docs.json", methods=['POST'])
@cache.cached(timeout=500)
def riksdags_docs_json():
    content = request.get_json()
    print(content)

    docs = util.fetch_document_qids(content['doc_ids'])
    return jsonify(docs)

@app.route("/lexeme-forms/ignore/<lid>", methods=['POST'])
def ignore_form(lid):
    result = util.ignore_form(lid)
    return result

@app.route("/lexeme-forms/sleep/<lid>", methods=['POST'])
def sleep_form(lid):
    result = util.sleep_form(lid)
    return jsonify(result)