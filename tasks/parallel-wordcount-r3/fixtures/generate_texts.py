import os, random
random.seed(912)
words = ["atom","ion","quark","photon","laser","plasma","vector","matrix","tensor","scalar","energy","entropy","quantum","neutron","nucleus","isotope","crystal","polymer","enzyme","protein","genome","neuron","cortex","cell","tissue","organ","virus","fossil","magma","crater","meteor","galaxy","nebula","orbit","comet","planet","pulsar","quasar","cosmos","gravity","gas","ray","heat","spin","node","flux","beam","gene","dose","mole","volt","ohm","watt","joule","hertz","probe","sensor","signal","data","graph","curve","model","theory","method","result","error","noise","filter","sample","phase","pulse","charge","torque","decay","prism","fusion","acid","salt","metal","alloy","carbon","oxygen","argon","helium","radius","mass","force","lens","circuit","cable"]
for i in range(20):
    with open(f"text_{i:02d}.txt", "w") as f:
        f.write(" ".join(random.choices(words, k=500)))
