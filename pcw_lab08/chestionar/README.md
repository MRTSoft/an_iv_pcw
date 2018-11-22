# Chestionar intrebari #

Intrebarile vor fi salvate in format JSON.

Forma unei intrebari va fi:
```
{
	text: "Unde s-a intamplat ceva?",
	tip: "numeric" | "text" | "simplu" | "multiplu";
	variante: [
		"r1",
	]
	corecte: [
		"r1", "R1".....
	]
}
```

