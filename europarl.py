#!/usr/bin/env python3
import logging

import config
import loglevel
import re
from collections import Counter

# TODO move common code to common swedish module
logger = logging.getLogger(__name__)
if config.loglevel is None:
    # Set loglevel
    print("Setting loglevel in config")
    loglevel.set_loglevel()
logger.setLevel(config.loglevel)
logger.level = logger.getEffectiveLevel()
file_handler = logging.FileHandler("europarl.log")
logger.addHandler(file_handler)

def find_words():
    with open(f'data_{config.language_code}.txt', 'r') as f:
        print("Opened file.")
        print("Reading into string.")
        all_text = f.read()
        print("Splitting into words.")
        words = re.split('[\ ,\.\?\(\);\n\]\[:…\xa0”"\/!&]', all_text.lower())
        print("Counting")
        counts = Counter(words)
        print("Showing 10 most common")
        print(counts.most_common(100))
    return list(counts)

def find_lines(word):
    """Returns a dictionary with line as
    key and linenumber as value"""

    records = {}
    print(f"Looking for {word} in the Europarl corpus...")
    with open(f'data_{config.language_code}.txt', 'r') as searchfile:
        number = 1
        for line in searchfile:
            if number % 50000 == 0:
                logger.info(number)
            if f" {word} " in line:
                logger.debug(f"matching line:{line}")
                records[line] = dict(
                    text=line,
                    line=number,
                    document_id=None,
                    date=None,
                    source="europarl",
                    language_style="formal",
                    type_of_reference="written",
                    quickstatement = f"""P5831|{config.language_code}:"{line.rstrip()}"|P6191|Q104597585""",
                    reference_quickstatement = f"""S248|Q5412081|S813|+2021-07-01T00:00:00Z/11|S577|+2012-05-12T00:00:00Z/11|S854|"http://www.statmt.org/europarl/v7/{config.language_code}-en.tgz"|S7793|"europarl-v7.{config.language_code}-en.{config.language_code}"|S7421|"{number}"|S3865|Q47461344"""
                )
            number += 1
    logger.debug(f"records:{records}")
    print(f"Found {len(records)} sentences")
    return records


def get_records_web(data,rb):
    word = data["word"]
    if(rb.bfExists('europarl',word)==0):
        print(f"Skipping looking for {word} in the Europarl corpus...")
        return []
    else:
        return find_lines(word)

def get_records(data):
    word = data["word"]
    # The lines are already split in sentences in the corpus. so we just return
    # them as is
    return find_lines(word)

    # TODO check len of records
    # if records is not None:
    #     if config.debug:
    #         print("Looping through records from Europarl corpus")
    #     summaries = riksdagen.extract_summaries_from_records(
    #         records, data
    #     )
    #     unsorted_sentences = {}
    #     # Iterate through the dictionary
    #     for summary in summaries:
    #         # Get result_data
    #         result_data = summaries[summary]
    #         # Add information about the source (written,oral) and
    #         # (formal,informal)
    #         result_data["language_style"] = "formal"
    #         result_data["type_of_reference"] = "written"
    #         # document_id = result_data["document_id"]
    #         # if config.debug_summaries:
    #         #     print(f"Got back summary {summary} with the " +
    #         #           f"correct document_id: {document_id}?")
    #         suitable_sentences = find_usage_examples_from_summary(
    #             word_spaces=data["word_spaces"],
    #             summary=summary
    #         )
    #         if len(suitable_sentences) > 0:
    #             for sentence in suitable_sentences:
    #                 # Make sure the riksdagen_document_id follows
    #                 unsorted_sentences[sentence] = result_data
    #     return unsorted_sentences
