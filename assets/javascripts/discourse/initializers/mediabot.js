import { withPluginApi } from "discourse/lib/plugin-api";

function initializeMediaBot(api) {
  // Admin interface modifications
  api.modifyClass("controller:admin-plugins", {
    actions: {
      clearMetrics() {
        return this.ajax("/admin/plugins/mediabot/clear_metrics", {
          type: "POST"
        }).then(() => {
          this.set("model.metrics", {});
        });
      },
      clearErrors() {
        return this.ajax("/admin/plugins/mediabot/clear_errors", {
          type: "POST"
        }).then(() => {
          this.set("model.errors", []);
        });
      },
      testApi() {
        if (!this.testTitle) {
          return;
        }

        this.set("testButtonDisabled", true);
        return this.ajax("/admin/plugins/mediabot/test_api", {
          type: "POST",
          data: {
            service: this.testService,
            title: this.testTitle
          }
        })
          .then(result => {
            this.set("testResult", JSON.stringify(result, null, 2));
          })
          .catch(error => {
            this.set("testResult", error.jqXHR.responseJSON.error);
          })
          .finally(() => {
            this.set("testButtonDisabled", false);
          });
      }
    }
  });

  // Add plugin outlet for post content
  api.addPostMenuButton("mediabot", (attrs) => {
    return {
      action: "showMediaInfo",
      icon: "film",
      title: "mediabot.show_info",
      position: "first"
    };
  });

  // Add plugin outlet for topic list
  api.decorateWidget("topic-list-item-title:after", (helper) => {
    const topic = helper.attrs;
    if (topic.tags && topic.tags.includes("movie")) {
      return helper.attach("mediabot-topic-indicator", { topic });
    }
  });
}

export default {
  name: "discourse-mediabot",
  initialize() {
    withPluginApi("0.8.31", initializeMediaBot);
  }
}; 