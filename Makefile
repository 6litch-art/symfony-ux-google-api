.PHONY: assets clean

ROOT_DIR := $(abspath ../../../)


APP_ENV_BAK   := $(APP_ENV)
APP_DEBUG_BAK := $(APP_DEBUG)
ifneq (,$(wildcard $(ROOT_DIR)/.env))
        include $(ROOT_DIR)/.env
endif
ifneq (,$(wildcard $(ROOT_DIR)/.env.$(APP_ENV)))
        include $(ROOT_DIR)/.env.$(APP_ENV)
endif
ifneq ($(strip $(APP_ENV_BAK)),)
        APP_ENV := $(APP_ENV_BAK)
endif
ifneq ($(strip $(APP_DEBUG_BAK)),)
        APP_DEBUG := $(APP_DEBUG_BAK)
endif
export APP_ENV APP_DEBUG

# Run from the package root, NOT from assets/. The sibling bundles
# (base-bundle-admin, base-bundle-wikidoc) keep their package.json inside
# assets/ and this target was copied from one of them, but this package keeps
# package.json and webpack.config.js at the root - so `cd assets` aborted with
# "can't cd to assets" and `make build-vendor glitchr/ux-google` could never
# build this bundle at all.
assets:
ifeq ($(APP_DEBUG),1)
	@yarn install
	@yarn run dev
else
	@yarn install
	@yarn run prod
endif

deploy:
	@composer update
	@yarn install

linter: phpstan phpcs

phpcs:
	../../../bin/php-cs-fixer fix src
phpstan:
	../../vendor/bin/phpstan analyse

tests:
	@echo "Not implemented yet."

clean:
	@$(RM) -rf composer.lock vendor assets/build assets/package-lock.json assets/yarn.lock
