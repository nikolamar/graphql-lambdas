build-PluginsLayer:
	echo "Build plugins layer"
	find plugins -name '*.ts' -exec npx esbuild {} --target=node16 --platform=node --minify=false --format=cjs --outdir=$(ARTIFACTS_DIR)/plugins \;