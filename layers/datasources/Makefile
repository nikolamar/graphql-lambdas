build-ConfigsLayer:
	echo "Build datasources layer"
	find datasources -name '*.ts' -exec npx esbuild {} --target=node16 --platform=node --minify=false --format=cjs --outdir=$(ARTIFACTS_DIR)/datasources \;