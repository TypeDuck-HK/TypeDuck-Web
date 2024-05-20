#include <boost/json/src.hpp>
#include <emscripten.h>
#include <rime_api.h>
#include <rime_levers_api.h>
#include <string>
#include <unordered_map>
#include <vector>

#define APP_NAME "TypeDuck-Web"
#define PAGE_SIZE_KEY "menu/page_size"
#define PATCH_DIRECTIVE "__patch"

const char* SETTINGS_PATCH_ITEMS[] = {
    "common:/show_cangjie_roots", "common:/disable_completion",
    "common:/enable_correction",  "common:/disable_sentence",
    "common:/disable_learning",   "common:/use_cangjie3"};

namespace typeduck {

RimeTraits traits = {0};
RimeSessionId session_id;
RimeCommit commit;
RimeContext context;
std::string json_string;
RimeApi* rime = rime_get_api();

bool settings_initialized = false;
RimeLeversApi* levers_api = NULL;
RimeCustomSettings* default_settings = NULL;
RimeCustomSettings* common_settings = NULL;

void handler(void*, RimeSessionId, const char* type, const char* value) {
  EM_ASM(onRimeNotification(UTF8ToString($0), UTF8ToString($1)), type, value);
}

bool start_rime(bool restart) {
  rime->initialize(&traits);
  rime->set_notification_handler(handler, NULL);
  if (restart ? rime->start_maintenance(true) : rime->start_quick()) {
    rime->join_maintenance_thread();
    return true;
  }
  return false;
}

bool stop_rime() {
  if (rime->destroy_session(session_id)) {
    rime->finalize();
    return true;
  }
  return false;
}

const char* process(Bool success) {
  boost::json::object result;
  result["success"] = !!success;
  rime->free_commit(&commit);
  if (rime->get_commit(session_id, &commit)) {
    result["committed"] = commit.text;
  }
  rime->free_context(&context);
  rime->get_context(session_id, &context);
  result["isComposing"] = !!context.composition.length;
  if (context.composition.length) {
    RimeComposition& composition = context.composition;
    std::string preedit = composition.preedit;
    boost::json::object pre_edit;
    pre_edit["before"] = preedit.substr(0, composition.sel_start);
    pre_edit["active"] = preedit.substr(
        composition.sel_start, composition.sel_end - composition.sel_start);
    pre_edit["after"] = preedit.substr(composition.sel_end);
    result["inputBuffer"] = pre_edit;
    RimeMenu& menu = context.menu;
    result["page"] = menu.page_no;
    result["isLastPage"] = !!menu.is_last_page;
    result["highlightedIndex"] = menu.highlighted_candidate_index;
    boost::json::array candidates;
    for (size_t i = 0; i < menu.num_candidates; ++i) {
      boost::json::object candidate;
      if (context.select_labels) {
        result["label"] = context.select_labels[i];
      }
      candidate["text"] = menu.candidates[i].text;
      if (menu.candidates[i].comment) {
        candidate["comment"] = menu.candidates[i].comment;
      }
      candidates.push_back(candidate);
    }
    result["candidates"] = candidates;
  }
  json_string = boost::json::serialize(result);
  return json_string.c_str();
}

extern "C" {

bool init() {
  RIME_STRUCT_INIT(RimeTraits, traits);
  traits.shared_data_dir = "/usr/share/rime-data";
  traits.user_data_dir = "/rime";
  traits.app_name = APP_NAME;
  rime->setup(&traits);
  RIME_STRUCT_INIT(RimeCommit, commit);
  RIME_STRUCT_INIT(RimeContext, context);
  if (start_rime(false)) {
    session_id = rime->create_session();
    return true;
  }
  return false;
}

void set_option(const char* option, int value) {
  rime->set_option(session_id, option, value);
}

const char* process_key(const char* input) {
  return process(rime->simulate_key_sequence(session_id, input));
}

const char* select_candidate(int index) {
  return process(rime->select_candidate_on_current_page(session_id, index));
}

const char* delete_candidate(int index) {
  return process(rime->delete_candidate_on_current_page(session_id, index));
}

const char* flip_page(bool backward) {
  return process(rime->change_page(session_id, backward));
}

bool customize(int page_size, int options) {
  if (!settings_initialized) {
    levers_api = (RimeLeversApi*)rime->find_module("levers")->get_api();
    default_settings = levers_api->custom_settings_init("default", APP_NAME);
    common_settings = levers_api->custom_settings_init("common", APP_NAME);
    settings_initialized = true;
  }
  Bool success = true;
  success &= levers_api->load_settings(default_settings);
  success &=
      levers_api->customize_int(default_settings, PAGE_SIZE_KEY, page_size);
  success &= levers_api->save_settings(default_settings);
  RimeConfig config = {0};
  success &= rime->config_init(&config);
  success &= rime->config_create_list(&config, "");
  for (size_t i = 0; i < sizeof(SETTINGS_PATCH_ITEMS); ++i) {
    if (options & (1 << i)) {
      success &=
          rime->config_list_append_string(&config, "", SETTINGS_PATCH_ITEMS[i]);
    }
  }
  success &= rime->config_set_item(&config, "", &config);
  success &= levers_api->load_settings(common_settings);
  success &=
      levers_api->customize_item(common_settings, PATCH_DIRECTIVE, &config);
  success &= levers_api->save_settings(common_settings);
  return !!success;
}

bool deploy() {
  if (stop_rime() && start_rime(true)) {
    session_id = rime->create_session();
    return true;
  }
  return false;
}
}

}  // namespace typeduck
