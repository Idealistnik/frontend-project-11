develop:
	npx webpack serve

install:
	npm ci

build:
	rm -rf dist	
	NODE_ENV=production npx webpack

lint-fix:
	npx eslint . --fix 

test:
	npm test

lint:
	npx eslint .

.PHONY: test