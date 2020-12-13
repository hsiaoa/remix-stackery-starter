FILES=remix/.npmrc remix/app remix/build remix/data remix/package.json remix/remix.config.js
ORIG=lambda
BUILD=lambda-build
ZIP=lambda.zip

all: clean copy
	cd ${BUILD}; \
		yarn install --production; \
		zip -FS -q -r ../${ZIP} *;

clean:
	rm -rf ${ZIP}
	rm -rf ${BUILD}

copy:
	mkdir -p ${BUILD}
	cp -rf ${ORIG}/* ${BUILD}
	cp -rf $(FILES) ${BUILD}
