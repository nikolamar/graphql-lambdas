current_dir = $(shell pwd)

build_utils:
	echo "Build utils"
	npx esbuild $(current_dir)/utils/**/*.ts --outdir=../.aws-sam/build/Dependencies/utils

build_configs:
	echo "Build configs"
	npx esbuild $(current_dir)/configs/**/*.ts --outdir=../.aws-sam/build/Dependencies/configs