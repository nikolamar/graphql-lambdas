build-ShareLayer:
	echo "Build share layer"
	find configs -name '*.ts' -exec npx esbuild {} --target=node16 --platform=node --minify=false --format=cjs --outdir=$(ARTIFACTS_DIR)/configs \;
	find datasources -name '*.ts' -exec npx esbuild {} --target=node16 --platform=node --minify=false --format=cjs --outdir=$(ARTIFACTS_DIR)/datasources \;
	find plugins -name '*.ts' -exec npx esbuild {} --target=node16 --platform=node --minify=false --format=cjs --outdir=$(ARTIFACTS_DIR)/plugins \;
	find utils -name '*.ts' -exec npx esbuild {} --target=node16 --platform=node --minify=false --format=cjs --outdir=$(ARTIFACTS_DIR)/utils \;