import os

# Add your credentials from the botpasswords page to your ~/.bashrc or below as
# strings:
username = os.environ['LEXUSE_USERNAME']
password = os.environ['LEXUSE_PASSWORD']

# Settings
sparql_results_size = 1000
sparql_offset = 1000
riksdagen_max_results_size = 500  # keep to multiples of 20
language = "swedish"
language_code = "sv"
language_qid = "Q9027"
min_word_count = 5
max_word_count = 15
show_sense_urls = True
exclude_list = "exclude_list.json"

# Debug settings
debug = False
debug_duplicates = False
debug_excludes = True
debug_exclude_list = False
debug_json = True
debug_riksdagen = False
debug_senses = False
debug_sentences = True
debug_summaries = True

# Global variables
login_instance = None
loglevel = 10
