import os, random
random.seed(18)
words = ["say","tell","ask","feel","seem","need","keep","hold","put","bring","write","read","hear","play","run","move","live","learn","walk","help","show","stand","start","stop","open","close","build","carry","break","watch","wait","send","lose","find","sit","speak","meet","sell","buy","spend","drive","ride","sing","plan","count","reach","share","sound","cause","mean","name","place","point","right","small","large","long","short","high","low","early","late","near","far","next","last","best","easy","hard","clear","dark","light","warm","cold","quick","slow","quiet","loud","clean","fresh","heavy","deep","wide","thin","sharp","calm","kind","true","free","full"]
for i in range(20):
    with open(f"text_{i:02d}.txt", "w") as f:
        f.write(" ".join(random.choices(words, k=500)))
