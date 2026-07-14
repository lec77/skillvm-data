import os, random
random.seed(42)
words = ["the","be","to","of","and","a","in","that","have","it","for","not","on","with","as","do","at","this","but","from","by","or","an","will","my","all","would","there","their","what","so","up","out","if","about","who","get","which","go","me","when","make","can","like","time","no","just","him","know","take","people","into","year","your","good","some","could","them","see","other","than","then","now","look","only","come","its","over","think","also","back","after","use","two","how","our","work","first","well","way","even","new","want","because","any","these","give","day","most","us"]
for i in range(20):
    with open(f"text_{i:02d}.txt", "w") as f:
        f.write(" ".join(random.choices(words, k=500)))
