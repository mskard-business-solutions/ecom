import Navbar from "@/components/navbar"
import SiteFooter from "@/components/site-footer"

const page = () => {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-medium mb-8 text-center">
          Privacy Policy
        </h1>
        <div className="prose max-w-none text-sm">
          <p>
            At <b>RAAS</b> the creation, we value and share your concerns about
            your privacy and security. This section details out how your
            personal information is collected, used, and shared when you visit
            or make a purchase from raasthe creation / www.raascreation.com (the
            “Site”).
          </p>
          <p>What do We Collect?</p>
          <p>Device Information</p>

          <p>
            When you visit the Site, we may collect certain information about
            your device, including information about your web browser, IP
            address, time zone, and some of the cookies that are installed on
            your device. Additionally, as you browse the Site, we may collect
            information about the individual web pages or products that you
            view, what websites or search terms referred you to the Site, and
            information about how you interact with the Site. We refer to this
            information as “Device Information.”
          </p>

          <p>
            We may collect Device Information using different types of tracking
            technologies, including the following:
          </p>
          <p>
            “Cookies” are data files that are placed on your device or computer
            and often include an anonymous unique identifier.
          </p>
          <p>
            “Log files” track actions occurring on the Site, and collect data
            including your IP address, browser type, Internet service provider,
            referring/exit pages, and date/time stamps.
          </p>
          <p>
            “Web beacons,” “tags,” and “pixels” are electronic files used to
            record information about how you browse the Site.
          </p>

          <p>Order Information</p>
          <p>
            When you make a purchase or attempt to make a purchase through the
            Site, we collect certain information from you, including your name,
            billing address, shipping address, payment information, email
            address, and phone number. We refer to this information as “Order
            Information.”
          </p>
          <p>How do We Use the Data Collected?</p>
          <p>
            We use the Order Information that we collect generally to fulfill
            any orders placed through the Site (including processing your
            payment information, arranging for shipping, and providing you with
            invoices and/or order confirmations). Additionally, we use this
            Order Information to:
          </p>
          <p>Communicate with you;</p>
          <p>Screen our orders for potential risk or fraud; and</p>
          <p>
            When in line with the preferences you have shared with us, provide
            you with information or advertising relating to our products or
            services.
          </p>
          <p>
            We use the Device Information that we collect to help us screen for
            potential risk and fraud (in particular, your IP address), and more
            generally to improve and optimize our Site (for example, by
            generating analytics about how our customers browse and interact
            with the Site, and to assess the success of our marketing and
            advertising campaigns).
          </p>
          <p>
            We might also use the Order Information or Device Information
            collected for retargeting/ advertising purposes
          </p>
          <p>Sharing your Information</p>
          <p>
            We might share your Information with third parties to help us use
            your Personal Information, as described above. For example, we use
            Google Analytics to help us understand how our customers use the
            Site.
          </p>
          <p>
            We may also share your Personal Information to comply with
            applicable laws and regulations, to respond to a subpoena, search
            warrant or other lawful request for information we receive, or to
            otherwise protect our rights.
          </p>
          <p>
            You understand that your content (not including financial
            information used while purchasing), may be transferred unencrypted
            and involve (a) transmissions over various networks; and (b) changes
            to conform and adapt to technical requirements of connecting
            networks or devices. Financial information is always encrypted
            during transfer over networks.
          </p>
          <p>Advertising</p>
          <p>
            As described above, we use your Personal Information to provide you
            with targeted advertisements or marketing communications we believe
            may be of interest to you.
          </p>
          <p>Data Retention</p>
          <p>
            When you place an order through the Site, we will maintain your
            Order Information for our records for an indefinite period.
          </p>
          <p>Minors</p>
          <p>Minors</p>
        </div>
      </div>

      <SiteFooter />
    </main>
  )
}

export default page