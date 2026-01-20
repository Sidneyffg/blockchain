Het programma gebruikt node.js, dit moet eerst geinstalleerd worden.
Vervolgens kan je deze repo clonen (main).
Vanuit de repo directory moet je in de terminal "npm i" runnen om alle packages te installeren.
Gebruik "node ." om het programma te starten.

Deze blockchain maakt gebruik van "seed nodes", deze worden gebruikt op een vast ip:port zodat nodes het netwerk kunnen vinden.
Om een seed te starten moet je in de index.js op lijntje 5 "node" naar "seed" verranderen.
Het netwerk staat ingesteld op localhost dus portforwarden is niet nodig.
Nadat de seed is gestart kan je meerdere nodes starten die met elkaar verbinden.
Je kan nog geen transacties maken.