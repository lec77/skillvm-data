import os, random
random.seed(311)
words = ["river","tree","stone","field","cloud","storm","wind","rain","snow","ice","fire","sand","hill","cave","lake","shore","coast","ridge","path","trail","wood","leaf","root","seed","grass","moss","fern","pine","oak","birch","bird","hawk","crow","owl","deer","wolf","bear","fox","hare","moth","bee","ant","fish","trout","whale","seal","crab","shell","reef","tide","wave","drift","bank","marsh","creek","pond","spring","valley","canyon","meadow","plain","dune","cliff","peak","slope","gorge","glade","willow","cedar","maple","aspen","alder","clover","thistle","lichen","granite","quartz","gravel","boulder","ember","frost","mist","haze","dusk","dawn","moon","star","sky","earth","rock"]
for i in range(20):
    with open(f"text_{i:02d}.txt", "w") as f:
        f.write(" ".join(random.choices(words, k=500)))
