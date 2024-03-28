(function () {
  "use strict";

  const JSON_FILE_URL = 'https://cmp.datasign.co/v2/529e0b8f18/opn.json'

  const categoryKeyToJa = (categoryKey) => ({
    ADVERTISING: "広告",
    ANALYTICS: "アクセス解析",
    DATA_AGGREGATION: "データ収集",
    FUNCTIONAL_SUPPORT: "機能補助",
    SECURITY: "セキュリティ",
    SOCIAL_PLUGIN: "ソーシャルプラグイン",
    PERSONALIZATION: "パーソナライズ",
  }[categoryKey])

  const createCategoryKeys = (services) => {
    const CategoryKeys = new Set();
    for (const sid in services) {
      CategoryKeys.add(services[sid].categoryKey)
    }
    return Array.from(CategoryKeys).sort();
  };

  $.when(
      $.getJSON(JSON_FILE_URL)
    )
    .done(function (resp_opn) {
      let opn_sources = resp_opn;
      opn_sources = Object.entries(opn_sources);
      console.log(opn_sources)

      const services = createOpnObject(opn_sources);

      CreateOpnNodeWrapper();

      let use_data
      for (const categoryKey of createCategoryKeys(services)) {
        switch (categoryKey) {
          case "ADVERTISING":
          case "ANALYTICS":
          case "DATA_AGGREGATION":
            use_data = 'use';
            break;
          default:
            use_data = 'not_use';
            break;
        }
        let _opn_node_parent = document.getElementById(use_data)
        CreateTableElement(_opn_node_parent, categoryKey);
      }

      for (const service of services) {
        $('<div>', {
          id: service.categoryKey + service.id,
          class: '_opn_node'
        }).appendTo($('div.' + service.categoryKey)[0]);
        if (SmCheck()) {
          $('<div>', {
            class: '_opn_node_inner_wrap name'
          }).appendTo($('div#' + service.categoryKey + service.id)[0]);
          $('<div>', {
            class: '_opn_node_inner_wrap provider'
          }).appendTo($('div#' + service.categoryKey + service.id)[0]);
          $('<div>', {
            class: '_opn_node_inner_wrap policy'
          }).appendTo($('div#' + service.categoryKey + service.id)[0]);
          $('<div>', {
            class: '_opn_node_inner_wrap optout'
          }).appendTo($('div#' + service.categoryKey + service.id)[0]);
        }
        $('<a>', {
          class: '_opn_node_items name',
          href: service.url,
          target: '_blank',
          text: service.name
        }).appendTo(SmCheck() ? $('div#' + service.categoryKey + service.id + ' ._opn_node_inner_wrap.name') : $('div#' + service.categoryKey + service.id))
        $('<a>', {
          class: '_opn_node_items provider',
          href: service.providerUrl,
          target: '_blank',
          text: service.provider
        }).appendTo(SmCheck() ? $('div#' + service.categoryKey + service.id + ' ._opn_node_inner_wrap.provider') : $('div#' + service.categoryKey + service.id))

        $('<a>', {
          class: '_opn_node_items policy',
          href: service.policy,
          target: '_blank',
          text: 'プライバシーポリシー'
        }).appendTo(SmCheck() ? $('div#' + service.categoryKey + service.id + ' ._opn_node_inner_wrap.policy') : $('div#' + service.categoryKey + service.id))
        $('<a>', {
          class: '_opn_node_items optout',
          href: service.optout,
          target: '_blank',
          text: 'オプトアウト'
        }).appendTo(SmCheck() ? $('div#' + service.categoryKey + service.id + ' ._opn_node_inner_wrap.optout') : $('div#' + service.categoryKey + service.id))
      };

      if (SmCheck()) {
        $('<span>', {
          class: '_opn_node_thead',
          text: 'サービス名'
        }).insertBefore($('a._opn_node_items.name'));

        $('<span>', {
          class: '_opn_node_thead',
          text: 'サービス提供元'
        }).insertBefore($('a._opn_node_items.provider'));

        $('<span>', {
          class: '_opn_node_thead',
          text: 'プライバシーポリシー'
        }).insertBefore($('a._opn_node_items.policy'));

        $('<span>', {
          class: '_opn_node_thead',
          text: 'オプトアウト'
        }).insertBefore($('a._opn_node_items.optout'));
      }

      function createOpnObject(opn_sources) {
        const result = []
        for (const opn_source of opn_sources) {
          const sid = readOpn(opn_source, 'sid');
          const name = readOpn(opn_source, 'nameJa');
          const optout = readOpn(opn_source, 'optoutUrl');
          const policy = readOpn(opn_source, 'policyUrl');
          const provider = readOpn(opn_source, 'provider');
          const providerUrl = readOpn(opn_source, 'providerUrl');
          const categoryKey = readOpn(opn_source, 'categoryKey');
          const url = readOpn(opn_source, 'url');

          if (name !== undefined) {
            result.push({
              id: sid,
              name: name,
              optout: optout,
              policy: policy,
              provider: provider,
              providerUrl: providerUrl,
              categoryKey: categoryKey,
              url: url
            });
          }
        }
        return result.sort(sortObjByValue);
      }

      function sortObjByValue(a, b) {
        let nameA = a.name.toUpperCase();
        let nameB = b.name.toUpperCase();

        let comparison = 0;
        if (nameA > nameB) {
          comparison = 1;
        } else if (nameA < nameB) {
          comparison = -1;
        };
        return comparison;
      };

      function readOpn(obj, key) {
        if (key === 'sid') {
          return obj[0];
        } else if (key === 'types' || key === 'typesJa' || key === 'name' || key === 'nameJa' || key === 'categoryKey') {
          return obj[1][key];
        } else {
          let pin = key + 'Ja';
          if (obj[1][pin] !== undefined) {
            return obj[1][pin];
          } else {
            return obj[1][key];
          }
        }
      }

      function CreateOpnNodeWrapper() {
        const type_text = {
          'use': 'パーソナルデータを利用している外部サービス',
          'not_use': 'パーソナルデータを利用していない外部サービス'
        }
        const opn_node = document.getElementById("online-privacy-notice")
        for (let key in type_text) {
          const node_wrapper = document.createElement("div")
          node_wrapper.id = key
          opn_node.appendChild(node_wrapper)

          const opn_node_header = document.createElement("span")
          opn_node_header.className = "_opn_node_header"
          opn_node_header.textContent = type_text[key]
          node_wrapper.appendChild(opn_node_header)
        }
      }

      function CreateTableElement(_opn_node_parent, categoryKey) {
        const category_name = document.createElement("p")
        category_name.className = "_opn_type_name"
        category_name.textContent = categoryKeyToJa(categoryKey)
        _opn_node_parent.appendChild(category_name)

        const opn_node_title = document.createElement("div")
        opn_node_title.className = '_opn_node_title'
        _opn_node_parent.appendChild(opn_node_title)

        const opn_node_inner = document.createElement("div")
        opn_node_inner.className = categoryKey + ' ' + '_opn_node_inner'
        _opn_node_parent.appendChild(opn_node_inner)

        if (!SmCheck()) {
          const service_name = document.createElement("span")
          service_name.className = "_opn_node_items name"
          service_name.textContent = "サービス名"
          opn_node_title.appendChild(service_name)

          const provider = document.createElement("span")
          provider.className = "_opn_node_items"
          provider.textContent = "サービス提供元"
          opn_node_title.appendChild(provider)

          const privacy_policy = document.createElement("span")
          privacy_policy.className = "_opn_node_items"
          privacy_policy.textContent = "プライバシーポリシー"
          opn_node_title.appendChild(privacy_policy)

          const opt_out = document.createElement("span")
          opt_out.className = "_opn_node_items"
          opt_out.textContent = "オプトアウト"
          opn_node_title.appendChild(opt_out)
        }
      }

      function SmCheck() {
        return window.outerWidth <= 600;
      }

      $("a._opn_node_items").each(function () {
        if (this.href.indexOf(location.host) >= 0) {
          $(this).addClass('no_href');
          $(this).click(function () {
            return false;
          });
        }
      });
    }).fail(function () {
      console.log("JSON Handling Error.");
    })
})();