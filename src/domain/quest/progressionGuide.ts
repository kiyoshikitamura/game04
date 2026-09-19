export type QuestGuideStep = 'QUEST_ENTRY' | 'PLAY' | 'GACHA' | 'LOADOUT' | 'RETRY' | 'DONE';
export type QuestProgressionGuide = { step: QuestGuideStep; seen_story_towns: string[] };
export type QuestGuideAction = 'ENTER_QUEST' | 'OPEN_LOADOUT' | 'APPLY_LOADOUT' | 'RETURN_QUEST';
export type QuestStoryPhase = 'START' | 'CLEAR';
export type QuestStoryStage = 'EASY' | 'NORMAL' | 'HARD';
export type QuestTownStoryData = { id: string; townId: string; stage: QuestStoryStage; speaker: string; image: string; lines: string[]; phase: QuestStoryPhase; presentation: { scale: number; positionX: number; positionY: number } };
/** シナリオのみの正本。戦闘・報酬・ステージ解放には影響させない。場面はID単位で増設可能。 */
export const QUEST_TOWN_STORIES: QuestTownStoryData[] = [
  {
    "id": "shinjuku:EASY:START",
    "townId": "shinjuku",
    "stage": "EASY",
    "phase": "START",
    "speaker": "織田信長",
    "image": "/characters/reiji_transparent_asset.png",
    "lines": [
      "名もなき城主よ。尾張の風は、おぬしをここへ運んだか。",
      "旗を掲げるだけでは民は守れぬ。まずは街道を確かめよ。",
      "わしも見届けよう。おぬしが誰のために刀を抜くのかを。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "shinjuku:EASY:CLEAR",
    "townId": "shinjuku",
    "stage": "EASY",
    "phase": "CLEAR",
    "speaker": "織田信長",
    "image": "/characters/reiji_transparent_asset.png",
    "lines": [
      "街道に灯が戻ったな。商人たちの足取りも軽い。",
      "小さな勝ちを侮るな。それを待っていた者には、何より大きな勝ちじゃ。",
      "次は川向こうの砦。兵の支度を整えてから参れ。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "shinjuku:NORMAL:START",
    "townId": "shinjuku",
    "stage": "NORMAL",
    "phase": "START",
    "speaker": "織田信長",
    "image": "/characters/reiji_transparent_asset.png",
    "lines": [
      "砦を守る者にも、退けぬ理由がある。",
      "声を聞かずに進めば、道の先々で同じ争いを繰り返すぞ。",
      "されど迷いを陣へ持ち込むな。決めたら、仲間を信じて進め。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "shinjuku:NORMAL:CLEAR",
    "townId": "shinjuku",
    "stage": "NORMAL",
    "phase": "CLEAR",
    "speaker": "織田信長",
    "image": "/characters/reiji_transparent_asset.png",
    "lines": [
      "見事。追い詰めるばかりが勝ちではないと知ったようじゃ。",
      "預かった旗は城へ返そう。ここからは、違う約束を結べばよい。",
      "尾張の境に最後の陣が残る。夜明けまで、気を抜くでない。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "shinjuku:HARD:START",
    "townId": "shinjuku",
    "stage": "HARD",
    "phase": "START",
    "speaker": "織田信長",
    "image": "/characters/reiji_transparent_asset.png",
    "lines": [
      "あの陣を越えれば、美濃への道が開く。",
      "天下という言葉は大きい。じゃが最初の一歩は、いつも足元にある。",
      "おぬしの一歩を見せよ。わしはここで旗を支える。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "shinjuku:HARD:CLEAR",
    "townId": "shinjuku",
    "stage": "HARD",
    "phase": "CLEAR",
    "speaker": "織田信長",
    "image": "/characters/reiji_transparent_asset.png",
    "lines": [
      "尾張を抜けたか。よい顔になった。",
      "美濃では秀吉が待っておる。あやつの笑顔に、油断するでないぞ。",
      "いつか同じ景色を、争いのない朝に見たいものじゃ。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "shibuya:EASY:START",
    "townId": "shibuya",
    "stage": "EASY",
    "phase": "START",
    "speaker": "豊臣秀吉",
    "image": "/characters/ageha_transparent_asset.png",
    "lines": [
      "待ってたよ、城主さま！　美濃の道はちょっと手ごわいよ。",
      "川も森も敵じゃない。よく見れば、味方にできるんだから。",
      "まずは渡し場へ行こう。帰りを待ってる人がいるんだ。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "shibuya:EASY:CLEAR",
    "townId": "shibuya",
    "stage": "EASY",
    "phase": "CLEAR",
    "speaker": "豊臣秀吉",
    "image": "/characters/ageha_transparent_asset.png",
    "lines": [
      "渡し場を取り戻したね。これで米俵も薬も運べる！",
      "戦の手柄って、槍の先だけにあるんじゃないんだよ。",
      "次は川沿いの砦。今度は、みんなの息を合わせよう。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "shibuya:NORMAL:START",
    "townId": "shibuya",
    "stage": "NORMAL",
    "phase": "START",
    "speaker": "豊臣秀吉",
    "image": "/characters/ageha_transparent_asset.png",
    "lines": [
      "昔はね、立派な旗を見るだけで遠い世界だと思ってた。",
      "でも、旗を支える手なら私にもある。それでここまで来たんだ。",
      "あなたの陣にもあるよね。まだ誰にも見つかってない力が。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "shibuya:NORMAL:CLEAR",
    "townId": "shibuya",
    "stage": "NORMAL",
    "phase": "CLEAR",
    "speaker": "豊臣秀吉",
    "image": "/characters/ageha_transparent_asset.png",
    "lines": [
      "うん、いい連携！　一人で急ぐより、ずっと遠くまで行ける。",
      "川辺の灯を消さずに済んだ。今日はそれが一番うれしいな。",
      "あと一つ。この道を、明日も安心して歩けるようにしよう。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "shibuya:HARD:START",
    "townId": "shibuya",
    "stage": "HARD",
    "phase": "START",
    "speaker": "豊臣秀吉",
    "image": "/characters/ageha_transparent_asset.png",
    "lines": [
      "美濃の最後の陣だよ。張りつめた空気まで伝わってくるね。",
      "怖くない、なんて言わない。怖いから、ちゃんと備えてきたんだ。",
      "さあ、あなたの合図で。私たちの旗を前へ！"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "shibuya:HARD:CLEAR",
    "townId": "shibuya",
    "stage": "HARD",
    "phase": "CLEAR",
    "speaker": "豊臣秀吉",
    "image": "/characters/ageha_transparent_asset.png",
    "lines": [
      "やったね！　美濃の川が、こんなに穏やかに見えるなんて。",
      "次は近江。湖の向こうにも、誰かの暮らしが続いてる。",
      "困ったら呼んでよ。あなたのためなら、一晩で橋だって考えちゃう！"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "ikebukuro:EASY:START",
    "townId": "ikebukuro",
    "stage": "EASY",
    "phase": "START",
    "speaker": "上杉謙信",
    "image": "/characters/koharu_transparent_asset.png",
    "lines": [
      "近江へようこそ。湖は静かでも、道まで静かとは限らない。",
      "ここでは急ぐ人ほど足を取られる。足元と、仲間の顔を見て。",
      "まず岸辺の集落へ。争いの気配を確かめよう。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "ikebukuro:EASY:CLEAR",
    "townId": "ikebukuro",
    "stage": "EASY",
    "phase": "CLEAR",
    "speaker": "上杉謙信",
    "image": "/characters/koharu_transparent_asset.png",
    "lines": [
      "集落は無事だね。井戸のそばで、子どもたちの声がした。",
      "守れたものを覚えておこう。次に迷った時、きっと支えになる。",
      "山道へ進もう。荷を軽くしても、備えまで捨てないように。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "ikebukuro:NORMAL:START",
    "townId": "ikebukuro",
    "stage": "NORMAL",
    "phase": "START",
    "speaker": "上杉謙信",
    "image": "/characters/koharu_transparent_asset.png",
    "lines": [
      "湖畔の約束は、言葉だけでは続かない。",
      "昨日の友が今日も友でいられるように、手を尽くす人がいる。",
      "あなたもその一人になれる？　答えは戦い方で聞かせて。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "ikebukuro:NORMAL:CLEAR",
    "townId": "ikebukuro",
    "stage": "NORMAL",
    "phase": "CLEAR",
    "speaker": "上杉謙信",
    "image": "/characters/koharu_transparent_asset.png",
    "lines": [
      "崩れなかったね。誰かが苦しい時、別の誰かが支えていた。",
      "そういう陣は強い。勝った後にも、ちゃんと人が残るから。",
      "湖を望む砦へ行こう。最後まで、同じ気持ちで。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "ikebukuro:HARD:START",
    "townId": "ikebukuro",
    "stage": "HARD",
    "phase": "START",
    "speaker": "上杉謙信",
    "image": "/characters/koharu_transparent_asset.png",
    "lines": [
      "あの砦では、今も戦うべきか話し合っているらしい。",
      "私たちは道を開く。でも、その先に恨みだけを残したくはない。",
      "手を抜く必要はないよ。勝った後のことまで考えて進もう。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "ikebukuro:HARD:CLEAR",
    "townId": "ikebukuro",
    "stage": "HARD",
    "phase": "CLEAR",
    "speaker": "上杉謙信",
    "image": "/characters/koharu_transparent_asset.png",
    "lines": [
      "湖面に旗が映っている。朝に見た時より、少し穏やかだ。",
      "次は京洛。言葉の裏まで見通す人たちが待っている。",
      "忘れないで。あなたが守りたいものは、ここでも見つかったはずだ。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "roppongi:EASY:START",
    "townId": "roppongi",
    "stage": "EASY",
    "phase": "START",
    "speaker": "真田幸村",
    "image": "/characters/kaede_transparent_asset.png",
    "lines": [
      "京洛へようこそ。花は美しく、噂はそれより早く広がる街よ。",
      "あなたの旗も、もう大勢が見ている。どう見られたいかしら？",
      "まずは門前へ。飾った言葉より、確かな足取りを見せて。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "roppongi:EASY:CLEAR",
    "townId": "roppongi",
    "stage": "EASY",
    "phase": "CLEAR",
    "speaker": "真田幸村",
    "image": "/characters/kaede_transparent_asset.png",
    "lines": [
      "門前の騒ぎが収まったわ。町の人も、ようやく店を開けられる。",
      "力の示し方にも品がある。今のあなたなら、覚えられそうね。",
      "次は路地の奥。大きな声に隠れた話を探しましょう。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "roppongi:NORMAL:START",
    "townId": "roppongi",
    "stage": "NORMAL",
    "phase": "START",
    "speaker": "真田幸村",
    "image": "/characters/kaede_transparent_asset.png",
    "lines": [
      "この街では、正しさを語るだけの人は珍しくないの。",
      "難しいのは、その言葉に見合う責任を引き受けること。",
      "あなたの判断で進んで。私は、その後ろを守るわ。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "roppongi:NORMAL:CLEAR",
    "townId": "roppongi",
    "stage": "NORMAL",
    "phase": "CLEAR",
    "speaker": "真田幸村",
    "image": "/characters/kaede_transparent_asset.png",
    "lines": [
      "なるほど。目先の誘いに飛びつかなかったのね。",
      "策を見抜くには、相手の強さだけでなく望みも知ること。",
      "最後の門へ行きましょう。そこで本当の答えが待っている。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "roppongi:HARD:START",
    "townId": "roppongi",
    "stage": "HARD",
    "phase": "START",
    "speaker": "真田幸村",
    "image": "/characters/kaede_transparent_asset.png",
    "lines": [
      "門の先で待つ人は、あなたの旗を試すつもりよ。",
      "勝ちを急げば、守りがおろそかになる。その隙を見せないで。",
      "焦らなくていいわ。あなたには、ここまで積み重ねたものがある。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "roppongi:HARD:CLEAR",
    "townId": "roppongi",
    "stage": "HARD",
    "phase": "CLEAR",
    "speaker": "真田幸村",
    "image": "/characters/kaede_transparent_asset.png",
    "lines": [
      "京洛の門が開いた。あなたの名を、また一つ覚える人が増えたわ。",
      "次は甲斐。山の風は、都の噂ほど優しくはないでしょうね。",
      "それでも行くのね。……では、また旗の下で会いましょう。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "akihabara:EASY:START",
    "townId": "akihabara",
    "stage": "EASY",
    "phase": "START",
    "speaker": "徳川家康",
    "image": "/characters/karen_transparent_asset.png",
    "lines": [
      "甲斐の山道へ来たのね。ここは見通しのいい場所ばかりじゃない。",
      "目に見える陣だけを数えていても、道は開けないよ。",
      "風を聞いて。待つべき時と進む時を、間違えないように。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "akihabara:EASY:CLEAR",
    "townId": "akihabara",
    "stage": "EASY",
    "phase": "CLEAR",
    "speaker": "徳川家康",
    "image": "/characters/karen_transparent_asset.png",
    "lines": [
      "最初の関を越えたね。まだ余力は残ってる？",
      "勝てたから正しかった、とは限らない。苦しかった所も覚えておいて。",
      "次の陣までに整えよう。手直しは、恥じゃないから。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "akihabara:NORMAL:START",
    "townId": "akihabara",
    "stage": "NORMAL",
    "phase": "START",
    "speaker": "徳川家康",
    "image": "/characters/karen_transparent_asset.png",
    "lines": [
      "林の向こうで旗が動いた。慌てて追わないで。",
      "強い相手ほど、こちらに動いてほしい時を用意してる。",
      "主導権を渡さないで。あなたの間合いで進めばいい。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "akihabara:NORMAL:CLEAR",
    "townId": "akihabara",
    "stage": "NORMAL",
    "phase": "CLEAR",
    "speaker": "徳川家康",
    "image": "/characters/karen_transparent_asset.png",
    "lines": [
      "今の判断はよかった。誘われた道へ、そのまま入らなかったね。",
      "備えが役に立つのは、こういう時。派手じゃなくても確かだよ。",
      "あと一陣。山の風が、少し変わってきた。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "akihabara:HARD:START",
    "townId": "akihabara",
    "stage": "HARD",
    "phase": "START",
    "speaker": "徳川家康",
    "image": "/characters/karen_transparent_asset.png",
    "lines": [
      "甲斐の要。守る側にも、積み上げた日々がある。",
      "簡単に勝てるなんて言わない。だからこそ、陣を見直して。",
      "準備ができたなら行こう。最後まで、目をそらさないで。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "akihabara:HARD:CLEAR",
    "townId": "akihabara",
    "stage": "HARD",
    "phase": "CLEAR",
    "speaker": "徳川家康",
    "image": "/characters/karen_transparent_asset.png",
    "lines": [
      "山道に陽が差した。長い戦いだったね。",
      "越後へ向かうなら、荷を整えて。雪の道は疲れをごまかせない。",
      "あなたなら行ける。……今のは、お世辞じゃないよ。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "kawasaki:EASY:START",
    "townId": "kawasaki",
    "stage": "EASY",
    "phase": "START",
    "speaker": "武田信玄",
    "image": "/characters/go_transparent_asset.png",
    "lines": [
      "越後へ来たか。雪道を越えてきた者を、言葉だけで試す気はない。",
      "ここで問うのは、苦しい時にも仲間を置き去りにしないかだ。",
      "まず街道へ。待っている者のために、道を切り開こう。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "kawasaki:EASY:CLEAR",
    "townId": "kawasaki",
    "stage": "EASY",
    "phase": "CLEAR",
    "speaker": "武田信玄",
    "image": "/characters/go_transparent_asset.png",
    "lines": [
      "よく進んだ。後ろを振り返る余裕も、失わなかったな。",
      "荷車が通れるようになれば、雪に閉ざされた里も息をつける。",
      "次は峠だ。勝ち急がず、一歩ずつ陣を進めよう。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "kawasaki:NORMAL:START",
    "townId": "kawasaki",
    "stage": "NORMAL",
    "phase": "START",
    "speaker": "武田信玄",
    "image": "/characters/go_transparent_asset.png",
    "lines": [
      "義という言葉は便利だ。掲げるだけなら誰にでもできる。",
      "だが、己に不利な時にも守れるか。それを私は見ている。",
      "旗を任せた仲間を信じろ。お前も、信じられる者であれ。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "kawasaki:NORMAL:CLEAR",
    "townId": "kawasaki",
    "stage": "NORMAL",
    "phase": "CLEAR",
    "speaker": "武田信玄",
    "image": "/characters/go_transparent_asset.png",
    "lines": [
      "峠を越えた。皆、よく踏みとどまったな。",
      "疲れた者には休息を。強さを求めるなら、それも将の務めだ。",
      "雪原の向こうが最後の陣だ。支度が整ったら声をかけろ。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "kawasaki:HARD:START",
    "townId": "kawasaki",
    "stage": "HARD",
    "phase": "START",
    "speaker": "武田信玄",
    "image": "/characters/go_transparent_asset.png",
    "lines": [
      "ここまで来た旗を、最後に折らせるわけにはいかない。",
      "迷いがあるなら今のうちに確かめろ。仲間も答えを持っている。",
      "さあ、共に進もう。勝利の先まで、皆を連れていく。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "kawasaki:HARD:CLEAR",
    "townId": "kawasaki",
    "stage": "HARD",
    "phase": "CLEAR",
    "speaker": "武田信玄",
    "image": "/characters/go_transparent_asset.png",
    "lines": [
      "越後の道は開いた。雪解けの水が、もう聞こえる。",
      "残るは天下分け目。ここまで交わした約束を、すべて持っていけ。",
      "お前の旗は一人のものではない。そのことを忘れるな。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "yokohama:EASY:START",
    "townId": "yokohama",
    "stage": "EASY",
    "phase": "START",
    "speaker": "織田信長",
    "image": "/characters/reiji_transparent_asset.png",
    "lines": [
      "よく来た。幾つもの国を越え、ようやくこの場所に立ったな。",
      "天下分け目とは、ただ一番強い者を決める場ではない。",
      "この先を誰と歩むか。おぬしの答えを、旗に示せ。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "yokohama:EASY:CLEAR",
    "townId": "yokohama",
    "stage": "EASY",
    "phase": "CLEAR",
    "speaker": "織田信長",
    "image": "/characters/reiji_transparent_asset.png",
    "lines": [
      "先陣を抜けたか。尾張で会った時とは、もう違う目をしておる。",
      "だが、その目が見ているものは変わっておらぬようじゃ。",
      "守りたい景色を忘れるな。次の陣は、いよいよ厚いぞ。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "yokohama:NORMAL:START",
    "townId": "yokohama",
    "stage": "NORMAL",
    "phase": "START",
    "speaker": "織田信長",
    "image": "/characters/reiji_transparent_asset.png",
    "lines": [
      "ここには、それぞれの正しさを背負った者が集う。",
      "すべてを同じ色に染める必要はない。並んで立つ道を探せばよい。",
      "まずは目の前の陣を越えよ。その先で、言葉を交わすためにな。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "yokohama:NORMAL:CLEAR",
    "townId": "yokohama",
    "stage": "NORMAL",
    "phase": "CLEAR",
    "speaker": "織田信長",
    "image": "/characters/reiji_transparent_asset.png",
    "lines": [
      "道が見えたな。敵味方を分けた霧が、少し晴れた。",
      "勝ちを誇るのはまだ早い。最後の陣が、おぬしを待っておる。",
      "ここまでの仲間に声をかけよ。共に進む支度をするのじゃ。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "yokohama:HARD:START",
    "townId": "yokohama",
    "stage": "HARD",
    "phase": "START",
    "speaker": "織田信長",
    "image": "/characters/reiji_transparent_asset.png",
    "lines": [
      "これが最後の陣。あの日掲げた旗は、まだ風を受けておる。",
      "わしはおぬしに天下を与えぬ。おぬし自身が、仲間と道を選べ。",
      "さあ、夜明けじゃ。皆が帰れる朝を、共に迎えよう。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  },
  {
    "id": "yokohama:HARD:CLEAR",
    "townId": "yokohama",
    "stage": "HARD",
    "phase": "CLEAR",
    "speaker": "織田信長",
    "image": "/characters/reiji_transparent_asset.png",
    "lines": [
      "終わったな。乱世のすべてが、一夜で変わるわけではない。",
      "それでも、ここに集った者たちは互いの顔を知った。約束を交わせる。",
      "刀を収めよ。城へ帰り、今日の続きを始めよう。物語は、ここからも続いてゆく。"
    ],
    "presentation": {
      "scale": 1.12,
      "positionX": 50,
      "positionY": 0
    }
  }
];
