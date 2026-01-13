.PHONY: *

dev: development
development: clean
	@cd assets
	@yarn install
	@yarn run dev

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

assets:
ifeq ($(APP_DEBUG),1)
	@cd assets && yarn install
	@cd assets && yarn run dev
else
	@cd assets && yarn install
	@cd assets && yarn run prod
endif

deploy:
	@composer update
	@yarn install

linter:
	@echo "Not implemented yet."

tests:
	@echo "Not implemented yet."

clean:
	@$(RM) -rf composer.lock vendor assets/build assets/package-lock.json assets/yarn.lock
