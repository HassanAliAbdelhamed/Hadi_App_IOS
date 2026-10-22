import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AllColors from "../assets/Colors";

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-forward"
            size={24}
            color={AllColors.whiteColor}
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          سياسة الخصوصية
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* Privacy Policy */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.policyCard}>

          <Text style={styles.appName}>
            هَدْي
          </Text>

          <Text style={styles.lastUpdated}>
            آخر تحديث: سبتمبر 2026
          </Text>

          <Text style={styles.intro}>
            مرحبًا بك في تطبيق هَدْي.
            {"\n\n"}
            نحن نحترم خصوصيتك ونحرص على حماية بياناتك.
            توضح سياسة الخصوصية هذه كيفية تعامل تطبيق هَدْي
            مع المعلومات والبيانات أثناء استخدامك للتطبيق.
          </Text>

          {/* 1 */}
          <Text style={styles.heading}>
            1. المعلومات التي نجمعها
          </Text>

          <Text style={styles.paragraph}>
            تم تصميم تطبيق هَدْي ليتيح لك الاستماع إلى القرآن
            الكريم والاستفادة من ميزاته الأساسية دون الحاجة إلى
            إنشاء حساب أو تقديم معلومات شخصية.
            {"\n\n"}
            قد يتم جمع بعض المعلومات التقنية بشكل تلقائي،
            وذلك حسب الخدمات المستخدمة داخل التطبيق، مثل:
          </Text>

          <Text style={styles.bullet}>
            • نوع الجهاز ونظام التشغيل.
            {"\n"}
            • إصدار التطبيق.
            {"\n"}
            • معلومات تقنية متعلقة بأداء التطبيق.
            {"\n"}
            • معلومات الأخطاء والأعطال، إذا كانت خدمات تحليل
            الأعطال مفعلة.
            {"\n"}
            • بيانات استخدام مجهولة أو مجمعة، إذا كانت خدمات
            التحليلات مفعلة.
          </Text>

          <Text style={styles.paragraph}>
            نحن لا نطلب منك تقديم معلومات شخصية مثل اسمك أو
            رقم هاتفك أو عنوانك لاستخدام الميزات الأساسية
            للتطبيق.
          </Text>

          {/* 2 */}
          <Text style={styles.heading}>
            2. أذونات التطبيق
          </Text>

          <Text style={styles.paragraph}>
            قد يطلب تطبيق هَدْي بعض الأذونات اللازمة لتوفير
            وظائف معينة، مثل تشغيل الملفات الصوتية وتشغيل
            القرآن الكريم في الخلفية.
            {"\n\n"}
            يتم استخدام الأذونات فقط للغرض المرتبط بالوظيفة
            التي تم طلب الإذن من أجلها.
          </Text>

          {/* 3 */}
          <Text style={styles.heading}>
            3. تشغيل القرآن في الخلفية
          </Text>

          <Text style={styles.paragraph}>
            يوفر تطبيق هَدْي إمكانية تشغيل القرآن الكريم أثناء
            استخدام تطبيقات أخرى أو عند إيقاف تشغيل شاشة الجهاز.
            {"\n\n"}
            قد يستخدم التطبيق خدمات تشغيل الصوت في الخلفية حتى
            يستمر الاستماع إلى القرآن الكريم دون الحاجة إلى
            إبقاء التطبيق مفتوحًا على الشاشة.
            {"\n\n"}
            لا يستخدم التطبيق الميكروفون لتسجيل المحادثات أو
            الأصوات الشخصية.
          </Text>

          {/* 4 */}
          <Text style={styles.heading}>
            4. الملفات الصوتية والتنزيلات
          </Text>

          <Text style={styles.paragraph}>
            قد يوفر تطبيق هَدْي إمكانية تنزيل بعض الملفات الصوتية
            للاستماع إليها دون اتصال بالإنترنت.
            {"\n\n"}
            في هذه الحالة، يتم تخزين الملفات الصوتية على جهازك
            لاستخدامها من خلال التطبيق.
            {"\n\n"}
            لا يقوم التطبيق بالوصول إلى ملفاتك الشخصية الأخرى
            إلا إذا كان ذلك ضروريًا لتوفير وظيفة محددة في التطبيق.
          </Text>

          {/* 5 */}
          <Text style={styles.heading}>
            5. الإعلانات
          </Text>

          <Text style={styles.paragraph}>
            قد يحتوي تطبيق هَدْي على إعلانات مقدمة من خدمات
            إعلانية تابعة لجهات خارجية، مثل Google AdMob.
            {"\n\n"}
            قد تستخدم خدمات الإعلانات بعض المعلومات، مثل معرّف
            الإعلانات الخاص بالجهاز ومعلومات الاستخدام، لعرض
            الإعلانات وقياس أدائها، وذلك وفقًا لسياسات الخصوصية
            الخاصة بمزود الخدمة وإعدادات الخصوصية المتاحة على
            جهازك.
            {"\n\n"}
            يمكن معرفة المزيد حول كيفية تعامل Google مع البيانات
            من خلال سياسة الخصوصية الخاصة بها.
          </Text>

          {/* 6 */}
          <Text style={styles.heading}>
            6. الخدمات التابعة لجهات خارجية
          </Text>

          <Text style={styles.paragraph}>
            قد يستخدم تطبيق هَدْي بعض الخدمات التابعة لجهات
            خارجية لتوفير وتحسين وظائف التطبيق، مثل خدمات
            الإعلانات أو التحليلات أو تقارير الأعطال.
            {"\n\n"}
            قد تقوم هذه الخدمات بجمع بعض المعلومات التقنية
            وفقًا لسياسات الخصوصية الخاصة بها.
          </Text>

          {/* 7 */}
          <Text style={styles.heading}>
            7. مشاركة المعلومات
          </Text>

          <Text style={styles.paragraph}>
            نحن لا نبيع أو نؤجر معلوماتك الشخصية لأي جهة.
            {"\n\n"}
            قد تتم مشاركة بعض المعلومات التقنية أو البيانات
            المجهولة والمجمعة مع مزودي الخدمات الذين يعتمد
            عليهم التطبيق لتوفير خدمات مثل الإعلانات أو تحليل
            الأداء أو اكتشاف الأعطال.
          </Text>

          {/* 8 */}
          <Text style={styles.heading}>
            8. حماية البيانات
          </Text>

          <Text style={styles.paragraph}>
            نحرص على اتخاذ الإجراءات المناسبة للمساعدة في حماية
            المعلومات التي يتم التعامل معها من خلال التطبيق.
            {"\n\n"}
            ومع ذلك، لا يمكن ضمان أن تكون أي وسيلة إلكترونية
            لنقل أو تخزين البيانات آمنة بنسبة 100%.
          </Text>

          {/* 9 */}
          <Text style={styles.heading}>
            9. خصوصية الأطفال
          </Text>

          <Text style={styles.paragraph}>
            تطبيق هَدْي مخصص لتوفير القرآن الكريم والاستماع إليه،
            ولا يطلب من المستخدمين تقديم معلومات شخصية لاستخدام
            الميزات الأساسية للتطبيق.
            {"\n\n"}
            نحن لا نجمع عن قصد معلومات شخصية من الأطفال.
          </Text>

          {/* 10 */}
          <Text style={styles.heading}>
            10. الروابط الخارجية
          </Text>

          <Text style={styles.paragraph}>
            قد يحتوي التطبيق على روابط لمواقع أو خدمات خارجية،
            مثل صفحة الدعم الخاصة بنا على Facebook أو صفحة
            التطبيق على Google Play.
            {"\n\n"}
            عند الانتقال إلى هذه المواقع، فإنك تخضع لسياسات
            الخصوصية وشروط الاستخدام الخاصة بهذه الجهات.
          </Text>

          {/* 11 */}
          <Text style={styles.heading}>
            11. التغييرات على سياسة الخصوصية
          </Text>

          <Text style={styles.paragraph}>
            قد نقوم بتحديث سياسة الخصوصية من وقت لآخر عند إضافة
            ميزات جديدة أو تغيير الخدمات المستخدمة داخل التطبيق.
            {"\n\n"}
            سيتم نشر أي تغييرات على هذه الصفحة مع تحديث تاريخ
            "آخر تحديث" الموجود في أعلى سياسة الخصوصية.
          </Text>

          {/* 12 */}
          <Text style={styles.heading}>
            12. التواصل معنا
          </Text>

          <Text style={styles.paragraph}>
            إذا كان لديك أي سؤال أو استفسار حول سياسة الخصوصية
            أو طريقة تعامل تطبيق هَدْي مع البيانات، يمكنك
            التواصل معنا من خلال صفحة الدعم والتواصل الموجودة
            داخل التطبيق.
          </Text>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>
              تطبيق هَدْي
            </Text>

            <Text style={styles.footerText}>
              نسعى إلى تقديم تجربة بسيطة وهادئة تساعدك على
              الاستماع إلى القرآن الكريم والاستفادة من التطبيق.
            </Text>
          </View>

        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AllColors.BlackBackgroundColor,
    direction: "rtl",
    paddingHorizontal: 16,
    paddingTop: 30,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    flex: 1,
    color: AllColors.whiteColor,
    fontFamily: "Cairo",
    fontSize: 22,
    textAlign: "center",
  },

  headerSpacer: {
    width: 40,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingBottom: 40,
  },

  // Card
  policyCard: {
    backgroundColor: "#1f2223",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 22,
  },

  // App name
  appName: {
    color: AllColors.greenColor,
    fontFamily: "Cairo",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },

  lastUpdated: {
    color: "#777",
    fontFamily: "Cairo",
    fontSize: 11,
    textAlign: "center",
    marginBottom: 24,
  },

  // Intro
  intro: {
    color: "#c7caca",
    fontFamily: "Cairo",
    fontSize: 15,
    lineHeight: 28,
    textAlign: "right",
    marginBottom: 10,
  },

  // Headings
  heading: {
    color: AllColors.greenColor,
    fontFamily: "Cairo",
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 24,
    marginBottom: 10,
  },

  // Paragraph
  paragraph: {
    color: "#c7caca",
    fontFamily: "Cairo",
    fontSize: 14,
    lineHeight: 27,
    textAlign: "right",
  },

  // Bullets
  bullet: {
    color: "#c7caca",
    fontFamily: "Cairo",
    fontSize: 14,
    lineHeight: 29,
    textAlign: "right",
    marginTop: 4,
    marginBottom: 8,
  },

  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#303536",
    marginTop: 30,
    paddingTop: 20,
  },

  footerTitle: {
    color: AllColors.greenColor,
    fontFamily: "Cairo",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 8,
  },

  footerText: {
    color: "#777",
    fontFamily: "Cairo",
    fontSize: 12,
    lineHeight: 23,
    textAlign: "right",
  },
});
