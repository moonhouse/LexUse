#!/usr/bin/env python3
import europarl
import pickle
import re
import redis
from redisbloom.client import Client


remove = set(['','-'])

def has_digit(word):
    return not re.search(r"[0-9]",word)

#pickle.dump( europarl.find_words(), open( "europarl-words.p", "wb" ) )
#words = europarl.find_words()
words = pickle.load( open( "europarl-words.p", "rb" ) )

it = filter(has_digit,words)
filtered_list = list(set(list(it))-remove)
print(len(filtered_list))
print(filtered_list[0])
rb = Client()
rb.bfCreate('europarl', 0.01, 321000)
rb.bfMAdd('europarl',*filtered_list)